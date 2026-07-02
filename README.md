# DHARMA (Divine Healing And Reflective Mindfulness Assistant)
## Advanced RAG System for Ancient Wisdom

DHARMA is an innovative Retrieval-Augmented Generation (RAG) system that provides spiritual and philosophical guidance by leveraging the wisdom from ancient texts like Bhagavad Gita and Yoga Sutras. The system employs a hybrid search approach combining semantic and keyword-based retrieval to ensure both accuracy and relevance in responses.

## 🌟 Features

- Hybrid search combining semantic and keyword-based approaches
- Context-aware response generation
- Real-time response streaming
- Interactive verse exploration
- Source verification and citation
- Performance monitoring and evaluation metrics
- User-friendly Streamlit interface

## 📋 Prerequisites

- Python 3.8 or higher
- Docker and Docker Compose (recommended for PostgreSQL + pgvector)
- Groq API key ([free at console.groq.com](https://console.groq.com))
- 8GB RAM minimum
- Git

## 🚀 Quick Start

Follow these steps after forking or cloning the repo. You only need to configure API keys and run one setup script.

### 1. Clone and install

```bash
git clone https://github.com/nikhilyadav09/Dharma_RAG.git
cd Dharma_RAG

python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your **Groq API key**:

```env
LLM_API_KEY_1=gsk_your_actual_key_here
```

The database defaults in `.env.example` already match Docker Compose — no DB changes needed for the recommended setup.

### 3. Start PostgreSQL (with pgvector)

```bash
docker compose up -d
```

Wait until the database is healthy:

```bash
docker compose ps
```

### 4. Build and seed the database (one-time)

```bash
python scripts/setup_database.py
```

This script will:
- Wait for PostgreSQL to be ready
- Create the `ancient_wisdoms` database (if needed)
- Enable the `pgvector` extension
- Generate embeddings and load all verses (~2–5 minutes on first run)

### 5. Run the chatbot

```bash
streamlit run app.py --server.fileWatcherType none
```

Open [http://localhost:8501](http://localhost:8501)

---

## 🛠️ Installation (native PostgreSQL alternative)

Use this only if you prefer a local PostgreSQL install instead of Docker.

1. **Clone, create venv, and install dependencies** (same as Quick Start step 1)

2. **Install PostgreSQL 16 and pgvector**
   ```bash
   sudo apt update
   sudo apt install postgresql-16 postgresql-16-pgvector
   sudo systemctl start postgresql
   ```

3. **Configure `.env`** with your PostgreSQL username and password

4. **Build the database**
   ```bash
   python scripts/setup_database.py
   ```

5. **Run the app**
   ```bash
   streamlit run app.py --server.fileWatcherType none
   ```

## 📊 Evaluation

Run the evaluation pipeline to measure system performance:
```bash
PYTHONPATH=. python src/evaluation/run_evaluation.py
```

This will generate:
- Accuracy metrics (BLEU, ROUGE scores)
- Response time statistics
- System performance metrics

## 🗂️ Project Structure

```
Dharma_RAG/
├── app.py                      # Streamlit chatbot entry point
├── docker-compose.yml          # PostgreSQL + pgvector (recommended)
├── scripts/
│   └── setup_database.py       # One-command DB setup + seeding
├── src/
│   ├── config/
│   │   ├── prompts.py          # Response templates
│   │   └── settings.py         # Configuration
│   ├── core/
│   │   ├── generator.py        # Response generation
│   │   ├── pipeline.py         # Main RAG pipeline
│   │   ├── query_preprocessor.py
│   │   ├── retriever.py        # Verse retrieval
│   │   └── store_data.py       # Embedding + insert logic
│   └── evaluation/
│       ├── run_evaluation.py
│       └── evaluator.py
├── data/                       # Source CSV datasets
├── requirements.txt
└── README.md
```

## 🔍 API Response Format

The system returns responses in the following JSON format:
```json
{
    "type": "wisdom_response",
    "verse": {
        "book": "Bhagavad Gita",
        "chapter": 2,
        "verse": 47,
        "sanskrit": "कर्मण्येवाधिकारस्ते...",
        "translation": "You have a right to perform your prescribed duty...",
        "explanation": "This verse emphasizes the importance of..."
    },
    "response": {
        "summary": "The wisdom from Bhagavad Gita teaches us...",
        "sources": ["Bhagavad Gita 2.47", "Yoga Sutras 1.2"]
    }
}
```

## 📊 Performance Metrics

Current system performance:
- Average Response Time: 1.17s
- Semantic Similarity: 0.43
- BLEU Score: 0.72
- ROUGE-1: 0.76
- Cache Hit Rate: 85%

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- DHARMA team

## 🙏 Acknowledgments

- Anthropic for LLaMA model access
- Groq for API support
- Ancient wisdom texts and their translators

## 🆘 Troubleshooting

1. **Database connection failed**
   ```bash
   docker compose ps          # check container is running
   docker compose up -d       # start if stopped
   docker compose logs db     # view database logs
   ```

2. **`pgvector` extension not available (native PostgreSQL)**
   ```bash
   sudo apt install postgresql-16-pgvector
   sudo systemctl restart postgresql
   ```
   Or use Docker instead: `docker compose up -d`

3. **Generic LLM responses / no real answers**
   - Ensure `LLM_API_KEY_1` in `.env` is a valid Groq key (not the placeholder)
   - Restart Streamlit after changing `.env`

4. **Terminal spam: `ModuleNotFoundError: torchvision`**
   - Harmless Streamlit file-watcher noise; the app still works
   - Run with: `streamlit run app.py --server.fileWatcherType none`
   - Or install: `pip install torchvision`

5. **Re-seed the database**
   ```bash
   python scripts/setup_database.py
   ```
   Warning: this drops and recreates the `verses` table.

6. **Missing Dependencies**
   ```bash
   pip install -r requirements.txt --upgrade
   ```

7. **Memory Issues**
   - Increase system swap space
   - Reduce batch size in `src/core/store_data.py`

## 📧 Contact

For any queries or support:
- Email: nikhilyadav1921@gmail.com
- GitHub Issues: [Create New Issue](https://github.com/nikhilyadav09/Dharma_RAG/issues)