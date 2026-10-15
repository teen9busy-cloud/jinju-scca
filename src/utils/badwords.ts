// 한국어 비속어, 욕설, 광고 및 도박 스팸 필터링 목록
export const BAD_WORDS = [
  // 광고 및 도박
  "카지노", "바카라", "토토", "슬롯", "성인용품", "대출", "일수", "조건만남", "출장샵", 
  "텔레그램", "라인아이디", "카톡아이디", "비아그라", "시알리스", "먹튀", "fx마진", "코인리딩",
  // 심한 욕설 및 비방
  "시발", "씨발", "병신", "개새끼", "새끼", "좆", "존나", "지랄", "닥쳐", "미친놈", "미친년", 
  "꺼져", "염병", "창녀", "걸레", "애자", "틀딱", "맘충", "한남", "한녀", "느금마", "애미", "애비"
];

export interface ValidationResult {
  isValid: boolean;
  matchedWord?: string;
  message?: string;
}

export function validateContent(text: string): ValidationResult {
  if (!text || text.trim().length === 0) {
    return { isValid: false, message: "내용을 입력해 주세요." };
  }

  const cleanText = text.replace(/[\s\-_.,!@#$%^&*()]/g, "").toLowerCase();

  for (const word of BAD_WORDS) {
    if (cleanText.includes(word)) {
      return {
        isValid: false,
        matchedWord: word,
        message: `부적절한 단어 또는 광고성 문구('${word}')가 포함되어 있어 등록할 수 없습니다. 건전한 소통을 위해 표현을 수정해 주세요.`,
      };
    }
  }

  return { isValid: true };
}
