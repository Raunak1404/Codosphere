// Judge0 API integration — code submission and result polling
// API key is loaded from environment variables (never hardcode).
import { env } from '../../config/env';
import {
  SubmissionRequest,
  SubmissionResponse,
  SubmissionResult,
  TestCase,
  languageIds,
} from './judge0.types';

const { apiUrl: API_URL, apiKey: API_KEY, apiHost: API_HOST } = env.judge0;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const commonHeaders = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': API_KEY,
  'X-RapidAPI-Host': API_HOST,
};

export const submitCode = async (
  code: string,
  language: string,
  input?: string,
  expectedOutput?: string,
  retryCount = 3,
  retryDelay = 1000
): Promise<string> => {
  try {
    const submissionData: SubmissionRequest = {
      source_code: code,
      language_id: languageIds[language] || languageIds.javascript,
    };
    if (input) submissionData.stdin = input;
    if (expectedOutput) submissionData.expected_output = expectedOutput;

    const response = await fetch(`${API_URL}/submissions?base64_encoded=false&wait=false`, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify(submissionData),
    });

    if (response.status === 429 && retryCount > 0) {
      console.log(`Rate limited, retrying after ${retryDelay}ms...`);
      await delay(retryDelay);
      return submitCode(code, language, input, expectedOutput, retryCount - 1, retryDelay * 2);
    }

    if (!response.ok) {
      throw new Error(`Failed to submit code: ${response.status} ${response.statusText}`);
    }

    const data: SubmissionResponse = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error submitting code:', error);
    throw error;
  }
};

export const getSubmissionResult = async (
  token: string,
  retryCount = 3,
  retryDelay = 1000
): Promise<SubmissionResult> => {
  try {
    const response = await fetch(`${API_URL}/submissions/${token}?base64_encoded=false`, {
      method: 'GET',
      headers: commonHeaders,
    });

    if (response.status === 429 && retryCount > 0) {
      console.log(`Rate limited, retrying after ${retryDelay}ms...`);
      await delay(retryDelay);
      return getSubmissionResult(token, retryCount - 1, retryDelay * 2);
    }

    if (!response.ok) {
      throw new Error(`Failed to get submission result: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as SubmissionResult;
  } catch (error) {
    console.error('Error getting submission result:', error);
    throw error;
  }
};

export const pollSubmissionResult = async (
  token: string,
  maxAttempts = 10,
  pollDelay = 2000
): Promise<SubmissionResult> => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const result = await getSubmissionResult(token);
    // Status 1 = In Queue, 2 = Processing
    if (result.status.id !== 1 && result.status.id !== 2) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, pollDelay));
    attempts++;
  }

  throw new Error('Submission processing timed out');
};

export const evaluateCodeWithTestCase = async (
  code: string,
  language: string,
  testCase: TestCase
): Promise<SubmissionResult> => {
  const token = await submitCode(code, language, testCase.input, testCase.expectedOutput);
  return await pollSubmissionResult(token);
};

export const evaluateCode = async (
  code: string,
  language: string,
  testCases: TestCase[]
): Promise<SubmissionResult[]> => {
  try {
    const results: SubmissionResult[] = [];
    for (const testCase of testCases) {
      if (results.length > 0) {
        await delay(1000); // avoid rate limiting between submissions
      }
      results.push(await evaluateCodeWithTestCase(code, language, testCase));
    }
    return results;
  } catch (error) {
    console.error('Error evaluating code:', error);
    throw error;
  }
};
