import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey, model = 'gemini-2.0-flash-exp' } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt는 필수입니다.' }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key가 설정되지 않았습니다.' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const geminiModel = genAI.getGenerativeModel({ model })

    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ 
      success: true, 
      response: text,
      model: model 
    })

  } catch (error: any) {
    console.error('Gemini API 오류:', error)
    
    // API 키 오류 처리
    if (error.message?.includes('API_KEY_INVALID') || error.status === 400) {
      return NextResponse.json({ 
        error: 'API Key가 유효하지 않습니다. 설정에서 올바른 API Key를 입력해주세요.' 
      }, { status: 401 })
    }

    // 할당량 초과 오류
    if (error.status === 429) {
      return NextResponse.json({ 
        error: 'API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.' 
      }, { status: 429 })
    }

    // 모델 오류
    if (error.message?.includes('model')) {
      return NextResponse.json({ 
        error: '선택된 모델을 사용할 수 없습니다. 다른 모델을 선택해보세요.' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'AI 서비스에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    }, { status: 500 })
  }
}