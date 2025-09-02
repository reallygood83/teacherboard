import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// DALL-E 스타일의 이미지 생성을 시뮬레이션하거나 
// 실제로는 OpenAI DALL-E API를 연동할 수 있습니다.
export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey, model = 'gemini-2.0-flash-exp' } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: '이미지 설명은 필수입니다.' }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key가 설정되지 않았습니다.' }, { status: 400 })
    }

    // Gemini로 이미지 프롬프트를 개선하고 교육적으로 적합한지 검증
    const genAI = new GoogleGenerativeAI(apiKey)
    const geminiModel = genAI.getGenerativeModel({ model })

    // 교육적 적절성 간단 체크 (부적절한 키워드 필터링)
    const inappropriateKeywords = ['폭력', '성인', '정치', '종교 갈등', '차별', '혐오']
    const isAppropriate = !inappropriateKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    )

    if (!isAppropriate) {
      return NextResponse.json({ 
        error: '교육용으로 적합하지 않은 내용입니다. 다른 주제를 시도해보세요.',
        suggestion: '예: 과학 실험, 역사적 인물, 지리적 특징 등'
      }, { status: 400 })
    }

    // Gemini로 프롬프트 개선 (JSON 파싱 오류 방지를 위해 단순화)
    const enhancePrompt = `다음 한국어 교육용 이미지 설명을 구체적인 영어 프롬프트로 변환해주세요. 교육용으로 적합하고 명확하게 작성해주세요: "${prompt}"`

    let enhancedPromptText = prompt // 기본값으로 원본 프롬프트 사용
    
    try {
      const result = await geminiModel.generateContent(enhancePrompt)
      const response = await result.response
      enhancedPromptText = response.text().trim()
    } catch (geminiError) {
      console.log('Gemini 프롬프트 개선 실패, 원본 사용:', geminiError)
      // Gemini 실패 시에도 계속 진행
    }

    // 실제 이미지 생성은 여기서는 플레이스홀더 이미지로 대체
    // 실제 구현에서는 DALL-E, Midjourney, Stable Diffusion 등의 API 연동
    const imageUrl = generateEducationalPlaceholder(enhancedPromptText)

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPromptText,
      style: '교육용 스타일',
      model: model 
    })

  } catch (error: any) {
    console.error('Gemini 이미지 생성 오류:', error)
    
    // API 키 오류 처리
    if (error.message?.includes('API_KEY_INVALID') || 
        error.message?.includes('API key') ||
        error.status === 400) {
      return NextResponse.json({ 
        error: 'API Key가 유효하지 않습니다. 설정에서 올바른 API Key를 입력해주세요.',
        details: error.message
      }, { status: 401 })
    }

    // 할당량 초과 오류
    if (error.status === 429) {
      return NextResponse.json({ 
        error: 'API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.' 
      }, { status: 429 })
    }

    // 네트워크 오류
    if (error.message?.includes('fetch')) {
      return NextResponse.json({ 
        error: '네트워크 연결 오류입니다. 인터넷 연결을 확인해주세요.' 
      }, { status: 503 })
    }

    // 기본 오류 - 더 자세한 정보 제공
    return NextResponse.json({ 
      error: '이미지 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      details: error.message || '알 수 없는 오류',
      type: error.constructor.name
    }, { status: 500 })
  }
}

// 교육용 플레이스홀더 이미지 생성 함수
function generateEducationalPlaceholder(prompt: string): string {
  // 실제로는 이미지 생성 API를 호출하지만,
  // 여기서는 교육적 플레이스홀더 이미지 URL을 반환
  
  // 다양한 교육적 주제에 따른 플레이스홀더 이미지 ID 선택
  const educationalImageIds = [
    200, 201, 202, 203, 204, 205, 206, 207, 208, 209, // 자연/과학
    300, 301, 302, 303, 304, 305, 306, 307, 308, 309, // 기술/도구  
    400, 401, 402, 403, 404, 405, 406, 407, 408, 409, // 건축/구조
    500, 501, 502, 503, 504, 505, 506, 507, 508, 509  // 추상/아트
  ]
  
  // 프롬프트 기반으로 적절한 이미지 선택
  const promptHash = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const imageId = educationalImageIds[promptHash % educationalImageIds.length]
  
  // 현재 시간을 사용한 캐시 버스팅
  const timestamp = Date.now()
  
  // Picsum Photos를 활용한 안정적인 플레이스홀더
  return `https://picsum.photos/id/${imageId}/500/400?t=${timestamp}`
  
  // 실제 DALL-E 3 연동 예시 (OpenAI API Key 필요):
  // const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     model: "dall-e-3",
  //     prompt: enhancedData.enhanced_prompt,
  //     n: 1,
  //     size: "1024x1024",
  //     style: "natural"
  //   })
  // })
  // const openaiData = await openaiResponse.json()
  // return openaiData.data[0].url
}