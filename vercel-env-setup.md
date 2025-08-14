# Vercel 환경 변수 설정 가이드

## 필수 환경 변수

Vercel 대시보드에서 다음 환경 변수들을 설정해야 합니다:

### Firebase Client 설정
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDyWjQPXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=teacher-board-4b6ef.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=teacher-board-4b6ef
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=teacher-board-4b6ef.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxxxxxxxx
```

### Firebase Admin SDK 설정
```
FIREBASE_PROJECT_ID=teacher-board-4b6ef
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@teacher-board-4b6ef.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC3uQjWpWhQVfoo
s73TLRBir6VDiQDIkW3yMxwq/QFs7MLXz/Xj4tVCOgaI7s+1jPxZcGEzff9JTeex
7ZnNW67G5sZH2FR0zfxsQ4BSMJ3T6KjICILEz7cwFC2+twaarXHIMb2QzNSGyHWp
Tyj6JV4aTxVjN0QB8VPRFkw66L70Lo4kN8u94QkpnrjReuYVlJ2a24571bsyvBvs
wBriUMQY+NJs/WMYo75OB0lqVjP+j+GjhwvOZzIgd0ESVVCsByoBQTCJoZ6WaT2Y
U8PBNb0CLzEfuX7wKFoiw6bIpM5KcFPAX8YtQFo87fs1ehlBAxaKYpqjL8xmNG1y
qtcblo2NAgMBAAECggEAIghYpspFJHyItnl1NGUon99Bkd0TFBQ8dZ0aHqx3UyIY
hbm0Jt6h+n6dL0htmYfgRwEWQF+apo2T2dXVo8DUA2xEVpKwMmLl23g1kQQIeHSk
r0lEUAjaOkHCp41n38c5SIhOQUBwLfd8NDzBrnS1ldIIeDSImIOHrzeeL1tl4/1a
wj9H3+oV5ydwFQmPotSPWIMX5kHECiMoL/Qxp1oOZZnaHsyUV1MbUEhFfhCll3+G
B/y5FENDsa/QatNX8wv3P7FW+AvOAHx5wcUGTr4d0P8A0w4r9X15ghYuc66k904w
l7v6uhzg2MIqIK6JPjO/q2YwLRSf4gmAo6r2zHicUQKBgQD2DjgHFmW5QHN3DLOA
xVHCz0eFLLYcrulxv907Ql1KNJbuS5k++ZEQX1XA3wwt2GnrLD9BTuScPNbJUMYc
XoaG9DX3ef6WpHYM2d24CF7fEeDAj+CjyYWRYuSM4ZvHMByykvJkAwRxamAh5yQH
ITyvmNbeSxzOE0JRlImyAAZIFwKBgQC/JeXpnb187VuwglyC09eEOvPDm61yO846
xMqMC1Vz/rGxAETzM2msFu/UflavA1906nGFesd/8DSKbQvl+eoGa+yh4MO3IeR3
YZ5HXKL6+Trqp/39kpKcOOtSCi+PyrgB4q6IlYjboSVyrWJCxy/3ygf9uuol6Xrd
7j+gm115+wKBgQDEyiR3Tqt22Rw/57Gc2LOGif8afOL918qvBhNrNK2mDp9z4JSk
8DbcEFNmWT3FYON9ijrhAbcHWgUyp157DAKt5p1O24wJcWlU595TNKaj5AmMGMZC
WIdx+tTt8/aB/XHGRI6F/H/OMZTHKLUA2s1NZ4DZ8tsL2g1db94ctbZQawKBgQCa
S9dJOyGIRHltA+31VVd0z7mRvorF2Wzhl5UAcu2p0oBRJqyBvJCib2ltGAaVA538
XHsCileb+KQQ0XF3VMMKJ/g9u5eAroUjsNL5O9f7y085uB2YoMZkALZD5SD7a2IZ
c4f7jOmKkIwQA9F7ohogZR8KO+VicRPTLcyCsqdEHQKBgQCk6zBnPU0UXM9J8leH
PyS+TheJXdx64nedn9hdcqZKfDaZjkbKH5gocvEfYdQ/X/Xuvab2aCNm+h/Ds2GX
GuDoAYvRSVnWVbRH6FrIwfb0p0gnSTCtgRvmRcsOqQPnh2/DESM3WfaV5R6QWEeN
8PeWomDF8o8JTf/od7WAxuoogw==
-----END PRIVATE KEY-----"
```

## Vercel 환경 변수 설정 방법

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택 (teacherboard)
3. Settings 탭 클릭
4. Environment Variables 섹션
5. 위의 모든 환경 변수 추가

## 주의사항

- `FIREBASE_PRIVATE_KEY`는 따옴표 포함해서 전체를 복사
- 개행 문자(\n)는 그대로 유지
- 모든 값은 실제 Firebase 프로젝트 값으로 교체 필요

## 확인 방법

환경 변수 설정 후 다시 배포하면 빌드가 성공해야 합니다.