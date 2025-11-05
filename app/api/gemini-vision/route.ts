import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { image, apiKey, model, prompt } = await request.json()

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      )
    }

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      )
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    // Google Generative AI 초기화
    const genAI = new GoogleGenerativeAI(apiKey)
    const visionModel = genAI.getGenerativeModel({ model: model || "gemini-1.5-flash" })

    // 이미지 데이터 처리 (base64 데이터에서 mime type과 데이터 분리)
    const base64Data = image.split(',')[1]
    const mimeType = image.split(',')[0].split(':')[1].split(';')[0]

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    }

    // Gemini Vision API 호출
    const result = await visionModel.generateContent([prompt, imagePart])
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ response: text })
  } catch (error: any) {
    console.error("Gemini Vision API Error:", error)
    
    // 에러 타입별 처리
    if (error.message?.includes("API_KEY_INVALID")) {
      return NextResponse.json(
        { error: "유효하지 않은 API 키입니다. 설정을 확인해주세요." },
        { status: 401 }
      )
    } else if (error.message?.includes("QUOTA_EXCEEDED")) {
      return NextResponse.json(
        { error: "API 할당량이 초과되었습니다." },
        { status: 429 }
      )
    } else if (error.message?.includes("RATE_LIMIT_EXCEEDED")) {
      return NextResponse.json(
        { error: "요청 횟수 제한에 도달했습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      )
    } else {
      return NextResponse.json(
        { error: error.message || "AI 처리 중 오류가 발생했습니다." },
        { status: 500 }
      )
    }
  }
}