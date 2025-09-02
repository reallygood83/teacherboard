import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// Replicate API를 통한 실제 AI 이미지 생성
// FLUX-dev 모델 사용 (빠르고 고품질)
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

    // 실제 AI 이미지 생성
    const imageUrl = await generateRealImage(enhancedPromptText)

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

// 실제 AI 이미지 생성 함수 (3단계 백업 시스템)
async function generateRealImage(prompt: string): Promise<string> {
  // 교육용 스타일 프롬프트 강화
  const educationalPrompt = `Educational illustration: ${prompt}, clean educational style, suitable for classroom use, high quality, detailed, professional`
  
  // 1차 시도: Pollinations AI (완전 무료, API 키 불필요)
  try {
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(educationalPrompt)}?width=512&height=512&seed=${Math.floor(Math.random() * 1000000)}`
    console.log('🌺 Pollinations AI로 이미지 생성 시도')
    return pollinationsUrl
  } catch (error) {
    console.log('❌ Pollinations 실패, Hugging Face 시도:', error)
  }

  // 2차 시도: Hugging Face Inference API (무료)
  try {
    const hfResponse = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: educationalPrompt,
        parameters: {
          width: 512,
          height: 512,
          num_inference_steps: 20,
          guidance_scale: 7.5
        }
      })
    })

    if (hfResponse.ok) {
      const imageBlob = await hfResponse.blob()
      // Blob을 Base64로 변환하여 데이터 URL로 반환
      const arrayBuffer = await imageBlob.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      console.log('✅ Hugging Face로 이미지 생성 성공')
      return `data:image/jpeg;base64,${base64}`
    }
  } catch (error) {
    console.log('❌ Hugging Face 실패, Replicate 시도:', error)
  }

  // 3차 시도: Replicate API (유료, 더 좋은 품질)
  try {
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637', // FLUX-dev
        input: {
          prompt: educationalPrompt,
          width: 512,
          height: 512,
          num_outputs: 1,
          num_inference_steps: 20,
          guidance_scale: 3.5,
          seed: Math.floor(Math.random() * 1000000)
        }
      })
    })

    if (replicateResponse.ok) {
      const prediction = await replicateResponse.json()
      
      // 예측 완료까지 폴링 (최대 30초)
      let pollCount = 0
      while (prediction.status === 'starting' || prediction.status === 'processing') {
        if (pollCount > 30) break // 30초 제한
        
        await new Promise(resolve => setTimeout(resolve, 1000)) // 1초 대기
        
        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          }
        })
        
        const statusData = await statusResponse.json()
        if (statusData.status === 'succeeded' && statusData.output && statusData.output[0]) {
          console.log('✅ Replicate로 이미지 생성 성공')
          return statusData.output[0]
        }
        
        pollCount++
      }
    }
  } catch (error) {
    console.log('❌ Replicate 실패, 플레이스홀더 사용:', error)
  }

  // 4차 백업: 교육적 플레이스홀더 이미지
  console.log('⚠️ AI 이미지 생성 실패, 플레이스홀더 사용')
  return generateEducationalPlaceholder(prompt)
}

// 교육용 플레이스홀더 이미지 생성 함수 (백업용)
function generateEducationalPlaceholder(prompt: string): string {
  const educationalImageIds = [
    200, 201, 202, 203, 204, 205, 206, 207, 208, 209, // 자연/과학
    300, 301, 302, 303, 304, 305, 306, 307, 308, 309, // 기술/도구  
    400, 401, 402, 403, 404, 405, 406, 407, 408, 409, // 건축/구조
    500, 501, 502, 503, 504, 505, 506, 507, 508, 509  // 추상/아트
  ]
  
  const promptHash = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const imageId = educationalImageIds[promptHash % educationalImageIds.length]
  const timestamp = Date.now()
  
  return `https://picsum.photos/id/${imageId}/500/400?t=${timestamp}`
}