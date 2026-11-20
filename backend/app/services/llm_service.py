from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

from app.schemas import InferenceResponse, LLMAnalysis

load_dotenv()


def _client() -> ChatGroq:
    return ChatGroq(
        model="openai/gpt-oss-120b",
        temperature=0.4,
        max_tokens=None,
        reasoning_format="hidden",
        reasoning_effort="medium",
        timeout=None,
        max_retries=2,
    )


sys_prompt = """
You are an expert ophthalmologist AI assistant specializing in retinal diseases, specifically Age-related Macular Degeneration (AMD).

Your task is to analyze raw machine learning inference probabilities from a patient's eye scan and translate them into a structured, easily understandable clinical analysis.

### INSTRUCTIONS:
1. Analyze the Probabilities: Identify the condition (NORMAL, DRUSEN, DME, CNV) and stage (BEGINNER, INTERMEDIATE, ADVANCED) with the highest probability scores.
2. Quality Check: If the visibility score is low (e.g., < 0.5), include a clinical caveat in your summary that the scan quality is poor and results should be verified.
3. Formulate Diagnosis: Write a clear clinical diagnosis based on the highest scoring results.
4. Recommend Treatment: Provide standard-of-care treatment options corresponding to the diagnosis (e.g., Anti-VEGF injections for CNV, AREDS2 vitamins and monitoring for intermediate Drusen, blood sugar control for DME).
5. Summarize: Write a cohesive summary of the patient's condition, the severity, and the recommended next steps.
"""

user_prompt = """
Here are the machine learning inference probabilities for the patient's eye scan:

{inference_data}

Please generate the structured medical analysis with keys: diagnosis, treatment, summary.
"""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", sys_prompt),
        ("user", user_prompt),
    ]
)


def generate_analysis(inference_data: InferenceResponse) -> LLMAnalysis:
    llm = _client()
    chain = prompt | llm.with_structured_output(LLMAnalysis)
    result = chain.invoke({"inference_data": inference_data.model_dump_json()})

    if not isinstance(result, LLMAnalysis):
        return LLMAnalysis()

    return result
