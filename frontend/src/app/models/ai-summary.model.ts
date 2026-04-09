export interface AiSummaryResponse {
  patientId: number;
  patientName: string;
  clinicalSummary: string;
  recommendations: string;
  generatedAt: string;
}
