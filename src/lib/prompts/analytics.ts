export const SYSTEM_PROMPT_TR =
  "Sen mülakat transkriptlerini analiz etmede uzman bir değerlendirme uzmanısın. Sadece verilen ana soruları kullanmalı, ek veya türetilmiş soru üretmemelisin. Detaylı, uygulanabilir ve nesnel analizler sunmalısın. ÇIKTI SADECE TÜRKÇE OLMALI.";

export const SYSTEM_PROMPT_EN =
  "You are an expert evaluator specializing in analyzing interview transcripts. You must use only the given main questions, do not generate additional or derived questions. Provide detailed, actionable, and objective analyses. OUTPUT MUST BE IN ENGLISH ONLY.";

export const getInterviewAnalyticsPrompt = (
  interviewTranscript: string,
  mainInterviewQuestions: string
) => {
  const summaryInstruction =
    "Detaylı özet kısmını mutlaka Türkçe ve akıcı bir dille yaz. ÇIKTI SADECE TÜRKÇE OLMALI.";

  return `ÇIKTI DİLİ: TÜRKÇE
Aşağıdaki mülakat transkriptini analiz et ve yapılandırılmış bir değerlendirme sun:

###
Transkript: ${interviewTranscript}

Ana Mülakat Soruları:
${mainInterviewQuestions}

Bu transkript ve verilen ana sorulara dayanarak aşağıdaki analizleri JSON formatında üret:
1. Genel Puan (0-100) ve Genel Geri Bildirim (120 kelime) - aşağıdaki faktörleri dikkate al:
   - İletişim Becerileri: Dil kullanımı, gramer, kelime dağarcığı ve karmaşık fikirleri ifade etme yeteneği.
   - Yanıt Kalitesi: Cevapların derinliği, ilgililiği ve yapısı, mümkünse STAR yöntemi kullanımı.
   - Profesyonellik: Görüşme adabı, nezaket ve profesyonel tutum.
   - Teknik Yeterlilik: Teknik bilgi ve karmaşık kavramları açıklama becerisi.
   - Eleştirel Düşünme: Problem çözme yaklaşımı, analitik beceriler ve mantıksal akıl yürütme.
   - Deneyim Aktarımı: Geçmiş deneyimlerin pozisyon gereklilikleriyle ilişkilendirilmesi.
   - Kurumsal Uyum: Kurum kültürüne ve değerlerine uyum.
   - Liderlik Potansiyeli: Liderlik ve yönetim becerileri (varsa).
   - Uyumluluk: Farklı durumlara esneklik ve uyum sağlama.
   - Yenilikçilik: Yaratıcı düşünme ve yeni çözümler sunabilme.
   - Stres Yönetimi: Baskı altında soğukkanlılık ve performans.
   - Gelişim Odaklılık: Yeni zorluklara öğrenme ve uyum sağlama isteği.

2. İletişim Becerileri: Puan (0-10) ve Geri Bildirim (100 kelime). İletişim becerileri için puanlama sistemi:
    - 10: Mükemmel Türkçe, zengin kelime dağarcığı, kusursuz gramer, karmaşık fikirleri mükemmel ifade etme.
    - 09: Çok iyi Türkçe, nadiren hata, gelişmiş dil kullanımı, karmaşık konuları rahatça ele alma.
    - 08: Çok iyi, ara sıra küçük hatalar, teknik terimleri etkili kullanma.
    - 07: İyi, bazı hatalar var ama genel olarak etkili iletişim.
    - 06: Yeterli, ara sıra hata ama genelde anlaşılır.
    - 05: Orta, belirgin hatalar ama temel iletişim sağlanıyor.
    - 04: Temel, sık hata ve karmaşık fikirleri ifade etmekte zorlanma.
    - 03: Sınırlı, ciddi iletişim engelleri.
    - 02: Çok sınırlı, büyük zorluklar.
    - 01: Etkili iletişim yok denecek kadar az.

3. Her ana mülakat sorusu için detaylı analiz: ${mainInterviewQuestions}
   - SADECE verilen ana soruları kullan, transcriptte olmasa bile tüm soruları sırala.
   - Her soru için şunları ver:
      a) Soru Durumu: "Sorulmadı", "Cevaplanmadı" veya "Cevaplandı"
      b) Yanıt Kalitesi (0-10, eğer cevaplandıysa)
      c) Detaylı Özet (100 kelime): ${summaryInstruction}
         - Cevabın ana noktaları
         - Verilen örnekler veya senaryolar
         - Gösterilen teknik bilgi
         - Cevabın geliştirilebileceği alanlar
      d) Temel Bulgular (madde madde)
      e) Gelişim Alanları (madde madde)

4. Kapsamlı Yumuşak Beceriler Değerlendirmesi (150 kelime):
   - Liderlik Özellikleri: Karar alma, delege etme, ekip yönetimi
   - Duygusal Zeka: Öz farkındalık, empati, ilişki yönetimi
   - Problem Çözme: Analitik düşünme, yaratıcılık, çözüm yaklaşımı
   - Uyumluluk: Esneklik, öğrenme isteği, değişime uyum
   - İletişim Tarzı: Açıklık, ikna kabiliyeti, aktif dinleme
   - Profesyonel Olgunluk: Öz disiplin, sorumluluk, iş ahlakı

5. Teknik Beceriler Değerlendirmesi (varsa):
   - Teknik Bilgi Puanı (0-10)
   - Güçlü Yönler (madde madde)
   - Gelişim Alanları (madde madde)
   - Teknik İletişim Becerisi (0-10)

Çıktı aşağıdaki JSON formatında olmalı:
{
  "overallScore": number,
  "overallFeedback": string,
  "communication": { 
    "score": number, 
    "feedback": string 
  },
  "questionAnalysis": [{
    "question": string,
    "status": string,
    "responseQuality": number,
    "summary": string,
    "keyInsights": string[],
    "improvementAreas": string[]
  }],
  "softSkillsAssessment": {
    "summary": string,
    "leadershipScore": number,
    "emotionalIntelligenceScore": number,
    "problemSolvingScore": number,
    "adaptabilityScore": number
  },
  "technicalAssessment": {
    "knowledgeScore": number,
    "strengths": string[],
    "developmentAreas": string[],
    "communicationScore": number
  }
}

ÖNEMLİ: Sadece verilen ana soruları kullan. Ek veya türetilmiş soru üretme. ÇIKTI SADECE TÜRKÇE OLMALI.`;
}

// İngilizce prompt ekleniyor
export const getInterviewAnalyticsPromptEn = (
  interviewTranscript: string,
  mainInterviewQuestions: string
) => {
  const summaryInstruction =
    "Write the detailed summary in fluent English. OUTPUT MUST BE IN ENGLISH ONLY.";

  return `OUTPUT LANGUAGE: ENGLISH
Analyze the following interview transcript and provide a structured evaluation:

###
Transcript: ${interviewTranscript}

Main Interview Questions:
${mainInterviewQuestions}

Based on this transcript and the given main questions, produce the following analyses in JSON format:
1. Overall Score (0-100) and Overall Feedback (120 words):\nWrite the overall feedback in fluent English. OUTPUT MUST BE IN ENGLISH ONLY.\nConsider the following factors:\n   - Communication Skills: Language usage, grammar, vocabulary, and ability to express complex ideas.\n   - Response Quality: Depth, relevance, and structure of answers, using STAR method if possible.\n   - Professionalism: Interview etiquette, courtesy, and professional attitude.\n   - Technical Proficiency: Technical knowledge and ability to explain complex concepts.\n   - Critical Thinking: Problem-solving approach, analytical skills, and logical reasoning.\n   - Experience Transfer: Relating past experiences to position requirements.\n   - Organizational Fit: Alignment with company culture and values.\n   - Leadership Potential: Leadership and management skills (if applicable).\n   - Adaptability: Flexibility and adaptation to different situations.\n   - Innovation: Creative thinking and ability to present new solutions.\n   - Stress Management: Composure and performance under pressure.\n   - Growth Orientation: Willingness to learn and adapt to new challenges.\n\n2. Communication Skills: Score (0-10) and Feedback (100 words).\nWrite the communication feedback in fluent English. OUTPUT MUST BE IN ENGLISH ONLY.\nScoring system for communication skills:\n    - 10: Excellent English, rich vocabulary, flawless grammar, perfect expression of complex ideas.\n    - 09: Very good English, rare errors, advanced language usage, comfortable handling complex topics.\n    - 08: Very good, occasional minor errors, effective use of technical terms.\n    - 07: Good, some errors but generally effective communication.\n    - 06: Adequate, occasional errors but generally understandable.\n    - 05: Moderate, noticeable errors but basic communication achieved.\n    - 04: Basic, frequent errors and difficulty expressing complex ideas.\n    - 03: Limited, serious communication barriers.\n    - 02: Very limited, major difficulties.\n    - 01: Effective communication almost non-existent.\n\n3. Detailed analysis for each main interview question: ${mainInterviewQuestions}\n   - USE ONLY the given main questions, list all questions even if not in the transcript.\n   - For each question, provide:\n      a) Question Status: "Not Asked", "Not Answered", or "Answered"\n      b) Response Quality (0-10, if answered)\n      c) Detailed Summary (100 words): Write the detailed summary in fluent English. OUTPUT MUST BE IN ENGLISH ONLY.\n         - Key points of the answer\n         - Examples or scenarios provided\n         - Technical knowledge demonstrated\n         - Areas for improvement in the answer\n      d) Key Insights (bullet points)\n      e) Improvement Areas (bullet points)\n\n4. Comprehensive Soft Skills Assessment (150 words):\nWrite the soft skills summary in fluent English. OUTPUT MUST BE IN ENGLISH ONLY.\n   - Leadership Traits: Decision-making, delegation, team management\n   - Emotional Intelligence: Self-awareness, empathy, relationship management\n   - Problem Solving: Analytical thinking, creativity, solution approach\n   - Adaptability: Flexibility, willingness to learn, adaptation to change\n   - Communication Style: Clarity, persuasiveness, active listening\n   - Professional Maturity: Self-discipline, responsibility, work ethics\n\n5. Technical Skills Assessment (if applicable):\nWrite the technical assessment in fluent English. OUTPUT MUST BE IN ENGLISH ONLY.\n   - Technical Knowledge Score (0-10)\n   - Strengths (bullet points)\n   - Development Areas (bullet points)\n   - Technical Communication Skill (0-10)\n\nOutput must be in the following JSON format:\n{\n  "overallScore": number,\n  "overallFeedback": string,\n  "communication": { \n    "score": number, \n    "feedback": string \n  },\n  "questionAnalysis": [{\n    "question": string,\n    "status": string,\n    "responseQuality": number,\n    "summary": string,\n    "keyInsights": string[],\n    "improvementAreas": string[]\n  }],\n  "softSkillsAssessment": {\n    "summary": string,\n    "leadershipScore": number,\n    "emotionalIntelligenceScore": number,\n    "problemSolvingScore": number,\n    "adaptabilityScore": number\n  },\n  "technicalAssessment": {\n    "knowledgeScore": number,\n    "strengths": string[],\n    "developmentAreas": string[],\n    "communicationScore": number\n  }\n}\n\nIMPORTANT: Use only the given main questions. Do not generate additional or derived questions. OUTPUT MUST BE IN ENGLISH ONLY.`;
}
