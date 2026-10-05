import os, hashlib
from datetime import datetime
from opensearchpy import OpenSearch
from langchain_community.embeddings import HuggingFaceEmbeddings

OPENSEARCH_HOST = os.environ.get("OPENSEARCH_HOST", "opensearch-service")
OPENSEARCH_PORT = int(os.environ.get("OPENSEARCH_PORT", "9200"))
PREFIX = os.environ.get("OPENSEARCH_DB_PREFIX", "dgpci").lower()
COLLECTION = "dgpci-regulations"
INDEX = f"{PREFIX}_{hashlib.md5(COLLECTION.encode()).hexdigest()}"
FILES = [
    "/tmp/fraude-vamale-vehicule.txt",
    "/tmp/producatori-vehicule-chineze.txt",
    "/tmp/reglementari-import-vehicule.txt",
]

print(f"Target index: {INDEX}")
emb = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
client = OpenSearch(hosts=[{"host": OPENSEARCH_HOST, "port": OPENSEARCH_PORT}])

DIM = 384
if not client.indices.exists(index=INDEX):
    client.indices.create(index=INDEX, body={
        "settings": {"index": {"knn": True}},
        "mappings": {"properties": {
            "embedding": {"type": "knn_vector", "dimension": DIM},
            "text": {"type": "text"},
            "metadata": {"type": "object"}
        }}
    })
    print(f"Created index {INDEX}")
else:
    print(f"Index {INDEX} already exists")

CHUNK_WORDS = 500
OVERLAP = 50

for fpath in FILES:
    fname = os.path.basename(fpath)
    text = open(fpath).read()
    words = text.split()
    chunks, i = [], 0
    while i < len(words):
        chunks.append(" ".join(words[i:i+CHUNK_WORDS]))
        i += CHUNK_WORDS - OVERLAP
    print(f"  {fname}: {len(chunks)} chunks")
    for idx, chunk in enumerate(chunks):
        vec = emb.embed_query(chunk)
        client.index(index=INDEX, body={
            "text": chunk,
            "embedding": vec,
            "metadata": {
                "source": fname,
                "collection": COLLECTION,
                "chunk_index": idx,
                "created_at": datetime.utcnow().isoformat()
            }
        })
    print(f"  {fname}: ingested OK")

print("Done.")
