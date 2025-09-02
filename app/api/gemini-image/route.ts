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

    const enhancePrompt = `
다음 이미지 생성 요청을 교육적으로 적합하고 구체적인 영어 프롬프트로 개선해주세요:
"${prompt}"

요구사항:
1. 교육적으로 적절한 내용인지 확인
2. 구체적이고 명확한 영어 프롬프트로 변환
3. 수업용으로 적합한 스타일 제안
4. 50단어 이내로 작성

응답 형식:
{
  "appropriate": true/false,
  "enhanced_prompt": "개선된 영어 프롬프트",
  "style": "교육용 스타일 설명"
}
`

    const result = await geminiModel.generateContent(enhancePrompt)
    const response = await result.response
    const enhancedData = JSON.parse(response.text())

    if (!enhancedData.appropriate) {
      return NextResponse.json({ 
        error: '교육용으로 적합하지 않은 내용입니다. 다른 주제를 시도해보세요.',
        suggestion: '예: 과학 실험, 역사적 인물, 지리적 특징 등'
      }, { status: 400 })
    }

    // 실제 이미지 생성은 여기서는 플레이스홀더 이미지로 대체
    // 실제 구현에서는 DALL-E, Midjourney, Stable Diffusion 등의 API 연동
    const imageUrl = generateEducationalPlaceholder(enhancedData.enhanced_prompt)

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      originalPrompt: prompt,
      enhancedPrompt: enhancedData.enhanced_prompt,
      style: enhancedData.style,
      model: model 
    })

  } catch (error: any) {
    console.error('Gemini 이미지 생성 오류:', error)
    
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

    return NextResponse.json({ 
      error: '이미지 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    }, { status: 500 })
  }
}

// 교육용 플레이스홀더 이미지 생성 함수
function generateEducationalPlaceholder(prompt: string): string {
  // 실제로는 이미지 생성 API를 호출하지만,
  // 여기서는 교육적 플레이스홀더 이미지 URL을 반환
  const encodedPrompt = encodeURIComponent(prompt.substring(0, 100))
  
  // Picsum Photos를 활용한 교육적 플레이스홀더
  // 실제 구현에서는 DALL-E 3, Midjourney API 등을 연동
  return `https://picsum.photos/400/300?random=${Date.now()}&blur=1`
  
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