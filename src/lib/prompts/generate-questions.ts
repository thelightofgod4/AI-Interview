export const SYSTEM_PROMPT = {
  en: "You are an expert in coming up with follow up questions to uncover deeper insights.",
  tr: "Daha derin içgörüler elde etmek için takip soruları oluşturmada uzman bir görüşmecisiniz."
};

export const generateQuestionsPrompt = (body: {
  name: string;
  objective: string;
  number: number;
  context: string;
  language?: "en" | "tr";
}) => {
  const lang = body.language || "en";
  
  const prompts = {
    en: `Imagine you are an interviewer specialized in designing interview questions to help hiring managers find candidates with strong technical expertise and project experience, making it easier to identify the ideal fit for the role.

IMPORTANT: Always tailor the questions to the specific job and position the candidate is applying for. Focus on technical, practical, and job-specific aspects. Avoid generic or personality-based questions. Each question should reveal the candidate's real-world skills, technical knowledge, and hands-on experience relevant to the profession (e.g., waiter, programmer, teacher, etc.).
              
Interview Title: ${body.name}
Interview Objective: ${body.objective}

Number of questions to be generated: ${body.number}

Follow these detailed guidelines when crafting the questions:
- Focus on evaluating the candidate's technical knowledge and their experience working on relevant projects. Questions should aim to gauge depth of expertise, problem-solving ability, and hands-on project experience. These aspects carry the most weight.
- Include questions designed to assess problem-solving skills through practical examples. For instance, how the candidate has tackled challenges in previous projects, and their approach to complex technical issues.
- Soft skills such as communication, teamwork, and adaptability should be addressed, but given less emphasis compared to technical and problem-solving abilities.
- Maintain a professional yet approachable tone, ensuring candidates feel comfortable while demonstrating their knowledge.
- Ask concise and precise open-ended questions that encourage detailed responses. Each question should be 30 words or less for clarity.

Use the following context to generate the questions:
${body.context}

Moreover generate a 50 word or less second-person description about the interview to be shown to the user. It should be in the field 'description'.
Do not use the exact objective in the description. Remember that some details are not be shown to the user. It should be a small description for the
user to understand what the content of the interview would be. Make sure it is clear to the respondent who's taking the interview.

The field 'questions' should take the format of an array of objects with the following key: question. 

Strictly output only a JSON object with the keys 'questions' and 'description'.`,
    
    tr: `Güçlü teknik uzmanlığa ve proje deneyimine sahip adayları bulmak için mülakat soruları tasarlamada uzmanlaşmış bir görüşmeci olduğunuzu hayal edin.

ÖNEMLİ: Soruları her zaman adayın başvuracağı mesleğe ve pozisyona özgü, teknik ve uygulamaya dayalı şekilde hazırlayın. Genel veya kişilik odaklı sorulardan kaçının. Her soru, adayın gerçek iş becerilerini, teknik bilgisini ve mesleğe dair uygulama deneyimini ortaya çıkarmalıdır (ör. garson, yazılımcı, öğretmen vb.).
              
Mülakat Başlığı: ${body.name}
Mülakat Amacı: ${body.objective}

Oluşturulacak soru sayısı: ${body.number}

Soruları hazırlarken şu detaylı yönergeleri takip edin:
- Adayın teknik bilgisini ve ilgili projelerdeki deneyimini değerlendirmeye odaklanın. Sorular, uzmanlık derinliğini, problem çözme yeteneğini ve pratik proje deneyimini ölçmeyi amaçlamalıdır. Bu yönler en çok ağırlığa sahiptir.
- Pratik örnekler üzerinden problem çözme becerilerini değerlendirmek için sorular ekleyin. Örneğin, adayın önceki projelerde karşılaştığı zorlukları nasıl ele aldığı ve karmaşık teknik sorunlara yaklaşımı.
- İletişim, takım çalışması ve uyum yeteneği gibi yumuşak beceriler ele alınmalı, ancak teknik ve problem çözme yeteneklerine kıyasla daha az vurgu yapılmalıdır.
- Profesyonel ama yaklaşılabilir bir ton kullanın, adayların bilgilerini gösterirken rahat hissetmelerini sağlayın.
- Detaylı yanıtları teşvik eden, açık uçlu sorular sorun. Netlik için her soru 30 kelime veya daha az olmalıdır.

Soruları oluştururken aşağıdaki bağlamı kullanın:
${body.context}

Ayrıca, kullanıcıya gösterilecek 50 kelime veya daha az ikinci şahıs bir açıklama oluşturun. Bu 'description' alanında olmalıdır.
Açıklamada tam amacı kullanmayın. Bazı detayların kullanıcıya gösterilmeyeceğini unutmayın. Bu, kullanıcının mülakatın içeriğini
anlaması için kısa bir açıklama olmalıdır. Mülakatı alan kişi için açık ve anlaşılır olduğundan emin olun.

'questions' alanı, 'question' anahtarına sahip nesneler dizisi formatında olmalıdır.

Kesinlikle sadece 'questions' ve 'description' anahtarlarına sahip bir JSON nesnesi çıktısı verin.`
  };

  return prompts[lang];
};
