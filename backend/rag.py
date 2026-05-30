from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings, OllamaLLM
import json
import pickle

def is_smalltalk(query):
    q = query.lower().strip()
    return q in ["hi", "hello", "hey", "thanks", "thank you"]

def format_history(chat_history, max_turns=5):
    history = chat_history[-max_turns:]
    formatted = ""
    for turn in history:
        formatted += f"User: {turn['user']}\n"
        formatted += f"Assistant: {turn['assistant']}\n"
    return formatted

def extract_current_topic(chat_history, query):
    # If this is a follow-up, return last topic
    followup_words = ["it", "this", "that", "he", "she", "they", "how", "why", "where"]

    if any(word in query.lower() for word in followup_words):
        # return last user question
        if chat_history:
            return chat_history[-1]["user"]
    
    return query

def bm25_search(query, k=3):

    with open("bm25.pkl", "rb") as f:
        bm25, texts, chunks = pickle.load(f)

    tokenized_query = query.lower().split()

    scores = bm25.get_scores(tokenized_query)

    top_indices = sorted(
        range(len(scores)),
        key=lambda i: scores[i],
        reverse=True
    )[:k]

    return [chunks[i] for i in top_indices]

def ask_question(query: str):

    if is_smalltalk(query):
        llm = OllamaLLM(model="llama3")
        return llm.invoke(query)
    
    # Load DB
    db = FAISS.load_local(
        "db",
        OllamaEmbeddings(model="nomic-embed-text"),
        allow_dangerous_deserialization=True
    )

    # Retrieve relevant chunks with scores
    results = db.similarity_search_with_score(query, k=5)

    print("\n🔍 Retrieved chunks:\n")
    for i, (doc, score) in enumerate(results):
        print(f"--- Chunk {i+1} (score: {score:.4f}) ---")
        print(doc.page_content[:300])
        print("\n")

    # Lower score = more similar in FAISS (L2 distance)
    filtered = [doc for doc, score in results if score < 0.7]
    # context = "\n\n".join([doc.page_content for doc in filtered]) if filtered else "\n\n".join([doc.page_content for doc, _ in results])
    context = "\n\n".join([doc.page_content for doc in filtered])

    # Local LLM
    llm = OllamaLLM(model="llama3")

    # prompt = f"""
    # Answer ONLY using the context below.
    # If answer not found, say "I don't know".

    # Context:
    # {context}

    # Question:
    # {query}
    # """

    if not context.strip():
        return llm.invoke(query)
    
    
    prompt = f"""
    You are a helpful assistant.

    If the context contains relevant information, use it.
    Otherwise, answer normally.

    Context:
    {context}

    Question:
    {query}
    """

    return llm.invoke(prompt)


def chat_with_memory(query: str, chat_history: list):

    if is_smalltalk(query):
        llm = OllamaLLM(model="llama3")
        return llm.invoke(query)
    # Load DB
    db = FAISS.load_local(
        "db",
        OllamaEmbeddings(model="nomic-embed-text"),
        allow_dangerous_deserialization=True
    )

    # Retrieve relevant chunks
    results = db.similarity_search_with_score(query, k=5)

    # Relevance filtering
    relevant_docs = [doc for doc, score in results if score < 1.2]

    if not relevant_docs:
        context = ""
    else:
        context = "\n\n".join([doc.page_content for doc in relevant_docs])

    # Convert chat history to string
    # history_text = ""
    # for chat in chat_history:
    #     history_text += f"User: {chat['user']}\nAssistant: {chat['assistant']}\n"

    history_text = format_history(chat_history)
    current_topic = extract_current_topic(chat_history, query)
    # LLM
    llm = OllamaLLM(model="llama3")

    prompt = f"""
            You are a helpful AI assistant.

            Use the conversation history and context to answer the question.

            Current topic of conversation:
            {current_topic}

            Rules:
            - ALWAYS prioritize the current question.
            - Use conversation history ONLY if it directly helps answer the current question.
            - Do NOT switch topics unless the user explicitly refers to something earlier.
            - If the question is a follow-up, assume it refers to the MOST RECENT topic.
            - Answer naturally and clearly.
            - Use conversation history if relevant.
            - Use context for factual answers.
            - Do NOT mention "context" or "history".
            - If answer is not found in context, answer normally.

            Conversation History:
            {history_text}

            Context:
            {context}

            Current Question:
            {query}

            If context is empty, answer normally.

            dont mention that you are using the context, just use it to answer the question. If the context does not contain relevant information, answer based on your general knowledge.
            dont mention conversation history, just use it to answer the question. If the conversation history contains relevant information, use it to answer the question. If not, answer based on your general knowledge.
            """

    return llm.invoke(prompt)


def chat_with_memory_stream(query: str, chat_history: list, selected_files=None):

    if is_smalltalk(query):
        llm = OllamaLLM(model="llama3", streaming=True)
        for chunk in llm.stream(query):
            yield json.dumps({"type": "token", "data": chunk}) + "\n"
        yield json.dumps({"type": "sources", "data": []}) + "\n"
        return

    # Load DB
    db = FAISS.load_local(
        "db",
        OllamaEmbeddings(model="nomic-embed-text"),
        allow_dangerous_deserialization=True
    )

    if selected_files:
        all_results = []
        for fname in selected_files:
            all_results += db.similarity_search_with_score(query, k=10, filter={"source": fname})
        results = all_results
    else:
        results = db.similarity_search_with_score(query, k=10)
    
    bm25_docs = bm25_search(query)

    # Relevance filtering — take top results, skip only very poor matches
    #relevant_docs = [doc for doc, score in results if score < 0.6]

    sources = []
    vector_docs = []
    seen_content = set()
    for doc, score in results:
        if score < 1.2:
            content = doc.page_content
            if content in seen_content:
                continue
            seen_content.add(content)
            vector_docs.append(doc)
            sources.append({
                "preview": content[:150],
                "source": doc.metadata.get("source", "Unknown"),
                "score": round(float(score), 4)
            })
    
    all_docs = vector_docs + bm25_docs

    relevant_docs = []

    for doc in all_docs:
        content = doc.page_content

        if content not in seen_content:
            seen_content.add(content)
            relevant_docs.append(doc)
        elif doc in vector_docs:
            relevant_docs.append(doc)

    if not relevant_docs:
        context = ""
    else:
        context = "\n\n".join([doc.page_content for doc in relevant_docs])

    print(f"\n📚 Relevant docs ({len(relevant_docs)}):")
    for s in sources:
        print(f"  score={s['score']} | source={s['source']} | {s['preview'][:100]}...")
    if not relevant_docs:
        print("  (none matched threshold)")

    # Convert chat history to string
    # history_text = ""
    # for chat in chat_history:
    #     history_text += f"User: {chat['user']}\nAssistant: {chat['assistant']}\n"

    history_text = format_history(chat_history)
    current_topic = extract_current_topic(chat_history, query)

    selected_files_info = ""
    if selected_files:
        selected_files_info = f"\nThe user has selected these files to focus on: {', '.join(selected_files)}\n"

    # LLM
    llm = OllamaLLM(model="llama3", streaming=True)

    prompt = f"""You are a concise, helpful AI assistant. Answer directly without repeating the user's question or restating what you already know. Never say things like "Based on what you've selected" or "As for the current topic". Just answer.
{selected_files_info}
Conversation History:
{history_text}

Context:
{context}

Question: {query}

Rules:
- Be concise. Get straight to the point.
- NEVER repeat or rephrase the user's question back to them.
- NEVER mention "context", "history", "selected files", or "based on your selection".
- Use the context silently to inform your answer.
- If the user asks what file/book they selected, just say the name briefly.
- If context is empty or irrelevant, answer from general knowledge.
- Do NOT end with "let me know if you want me to elaborate" or similar filler."""

    for chunk in llm.stream(prompt):
        yield json.dumps({"type": "token", "data": chunk}) + "\n"
    # After streaming is done, send sources if any
    yield json.dumps({"type": "sources", "data": sources}) + "\n"