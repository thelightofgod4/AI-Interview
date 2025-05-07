export const SYSTEM_PROMPT =
  "Sen mülakat transkriptlerini analiz etmede uzman bir değerlendirme uzmanısın. Sadece verilen ana soruları kullanmalı, ek veya türetilmiş soru üretmemelisin. Detaylı, uygulanabilir ve nesnel analizler sunmalısın.";

export const getInterviewAnalyticsPrompt = (
  interviewTranscript: string,
  mainInterviewQuestions: string,
) => `Aşağıdaki mülakat transkriptini analiz et ve yapılandırılmış bir değerlendirme sun:

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
      c) Detaylı Özet (100 kelime):
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

ÖNEMLİ: Sadece verilen ana soruları kullan. Ek veya türetilmiş soru üretme.`;
