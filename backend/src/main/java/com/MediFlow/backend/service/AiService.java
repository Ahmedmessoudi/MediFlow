package com.MediFlow.backend.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import okhttp3.*;
import com.MediFlow.backend.dto.AiSummaryResponse;
import com.MediFlow.backend.entity.Patient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class AiService {

    @Value("${app.ai.api-key}")
    private String apiKey;

    private static final String OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
    private static final String MODEL_NAME = "openrouter/free";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Generate clinical summary and recommendations for a patient using AI
     */
    public AiSummaryResponse generatePatientSummary(Patient patient) {
        try {
            log.info("Generating AI summary for patient: {}", patient.getFullName());

            // Build the prompt with patient information
            String prompt = buildPrompt(patient);

            // Call OpenRouter API via REST
            String aiResponse = callOpenRouterApi(prompt);

            // Parse response into clinical summary and recommendations
            String[] parts = parseResponse(aiResponse);
            String clinicalSummary = parts[0];
            String recommendations = parts[1];

            log.info("AI summary generated successfully for patient: {}", patient.getFullName());

            return AiSummaryResponse.builder()
                    .patientId(patient.getId())
                    .patientName(patient.getFullName())
                    .clinicalSummary(clinicalSummary)
                    .recommendations(recommendations)
                    .generatedAt(LocalDateTime.now().format(FORMATTER))
                    .build();

        } catch (Exception e) {
            log.error("Error generating AI summary: {}", e.getMessage());
            throw new RuntimeException("Failed to generate AI summary: " + e.getMessage(), e);
        }
    }

    /**
     * Call OpenRouter API using REST (OkHttp)
     */
    private String callOpenRouterApi(String prompt) throws IOException {
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                .build();

        // Build request JSON
        JsonObject requestBody = new JsonObject();
        requestBody.addProperty("model", MODEL_NAME);
        
        JsonObject message = new JsonObject();
        message.addProperty("role", "user");
        message.addProperty("content", prompt);
        
        JsonArray messages = new JsonArray();
        messages.add(message);
        
        requestBody.add("messages", messages);

        RequestBody body = RequestBody.create(
                requestBody.toString(),
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url(OPENROUTER_API_URL)
                .addHeader("Authorization", "Bearer " + apiKey)
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                throw new RuntimeException("OpenRouter API error: " + response.code() + " - " + errorBody);
            }

            String responseBody = response.body().string();
            JsonObject jsonResponse = JsonParser.parseString(responseBody).getAsJsonObject();

            // Extract text from OpenRouter response
            return jsonResponse
                    .getAsJsonArray("choices")
                    .get(0).getAsJsonObject()
                    .getAsJsonObject("message")
                    .get("content").getAsString();
        }
    }

    /**
     * Build AI prompt with patient information
     */
    private String buildPrompt(Patient patient) {
        return String.format(
                "You are a professional medical assistant. Generate a clinical summary and care recommendations for the following patient:\n\n" +
                "**Patient Information:**\n" +
                "- Name: %s\n" +
                "- Age: %s\n" +
                "- Current Condition: %s\n" +
                "- Admission Date: %s\n" +
                "- Bed Assignment: %s\n" +
                "- Medical Notes: %s\n\n" +
                "Please provide:\n" +
                "1. A brief clinical summary (2-3 sentences) about the patient's current status\n" +
                "2. Recommended care actions and monitoring points (3-5 bullet points)\n\n" +
                "Format your response as:\n" +
                "SUMMARY:\n[clinical summary here]\n\n" +
                "RECOMMENDATIONS:\n[recommendations here]",
                patient.getFullName(),
                patient.getAge() != null ? patient.getAge() : "N/A",
                patient.getCondition().toString(),
                patient.getAdmissionDate().format(FORMATTER),
                patient.getBed() != null ? patient.getBed().getBedNumber() : "Not assigned",
                patient.getMedicalNotes() != null ? patient.getMedicalNotes() : "None"
        );
    }

    /**
     * Parse AI response into summary and recommendations sections
     */
    private String[] parseResponse(String response) {
        String[] parts = new String[2];

        try {
            // Extract SUMMARY section
            int summaryStart = response.indexOf("SUMMARY:");
            int summaryEnd = response.indexOf("RECOMMENDATIONS:");

            if (summaryStart != -1 && summaryEnd != -1) {
                parts[0] = response.substring(summaryStart + 8, summaryEnd).trim();
            } else {
                // Fallback: use first part as summary
                parts[0] = response.substring(0, Math.min(500, response.length()));
            }

            // Extract RECOMMENDATIONS section
            int recStart = response.indexOf("RECOMMENDATIONS:");
            if (recStart != -1) {
                parts[1] = response.substring(recStart + 16).trim();
            } else {
                parts[1] = "Recommendations not available";
            }

        } catch (Exception e) {
            log.warn("Error parsing AI response: {}", e.getMessage());
            parts[0] = response;
            parts[1] = "Failed to parse recommendations";
        }

        return parts;
    }
}
