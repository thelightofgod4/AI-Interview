import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "createInterviewTitle": "Create Interview",
      "shareVia": "Share via:",
      "link": "Link",
      "embed": "Embed",
      "copyUrl": "Copy URL",
      "copyEmbedCode": "Copy Embed Code",
      "width": "Width (px)",
      "height": "Height (px)",
      "summary": "Summary",
      "share": "Share",
      "edit": "Edit",
      "interviewersTitle": "Interviewers",
      "interviewersSubtitle": "Get to know them by clicking the profile.",
      "myInterviewsTitle": "My Interviews",
      "myInterviewsSubtitle": "Start getting answers right away!",
      "createInterviewCard": "Create Interview",
      "interviewName": "Interview Name",
      "selectInterviewer": "Select Interviewer",
      "objective": "Objective",
      "questionCount": "Number of Questions",
      "duration": "Duration (min)",
      "generateQuestions": "Generate Questions",
      "manualEntry": "I will enter manually",
      "question": "Question",
      "depthLevel": "Depth Level",
      "low": "Low",
      "medium": "Medium",
      "high": "High",
      "addQuestion": "Add Question",
      "interviewDescription": "Interview Description",
      "save": "Save",
      "noteInterviewDescription": "Note: Participants will see this description.",
      "responses": "Responses",
      "sidebarInterviews": "Interviews",
      "sidebarInterviewers": "Interviewers",
      "questionInfo": "We will use these questions in interviews. Please make sure your questions are appropriate.",
      "questionLabel": "Question",
      "placeholderInterviewName": "e.g. Interview Name",
      "placeholderObjective": "e.g. Evaluate the candidate's technical skills and previous projects.",
      "summaryTab": "Summary",
      "active": "Active",
      "filter": "Filter",
      "all": "All",
      "responsesTab": "Responses",
      "generalEvaluation": "General Evaluation",
      "interviewer": "Interviewer",
      "responseStats": "Response Statistics",
      "totalResponses": "Total Responses",
      "completed": "Completed",
      "candidateStatus": "Candidate Status",
      "selected": "Selected",
      "potential": "Potential",
      "notSelected": "Not Selected",
      "averageDuration": "Average Duration",
      "minutes": "Minutes",
      "name": "Name",
      "overallScore": "Overall Score",
      "communicationScore": "Communication Score",
      "inactive": "Inactive",
      "responseOf": "{{name}}'s Response",
      "backToSummary": "Back to Summary",
      "placeholderInterviewDescription": "Enter the interview description here.",
      "questions": "Questions",
      "recording": "Interview Recording",
      "generalSummary": "General Summary",
      "generalScore": "General Score",
      "communication": "Communication",
      "userSentiment": "User Sentiment",
      "interviewSummary": "Interview Summary",
      "transcript": "Transcript",
      "feedback": "Feedback",
      "congratulations": "Congratulations on your interview.",
      "endOfInterview": "Ending the interview. Thank you for participating!",
      "aiInterviewer": "AI interviewer",
      "user": "User",
      "questionSummary": "Question Summary",
      "minuteShort": "m",
      "secondShort": "s",
      "noStatus": "No Status",
      "userFeedback": "User Feedback",
      "satisfactionLevel": "Satisfaction Level",
      "satisfactionNote": "Based on user feedback after the interview",
      "writtenFeedback": "Written Feedback",
      "noFeedbackProvided": "No feedback provided by the user",
      "moderate": "Moderate",
      "good": "Good",
      "bad": "Bad",
      "noFeedbackGiven": "No feedback was provided",
      "noWrittenComment": "No written comment was provided",
      // Pop-up translations
      "areYouSure": "Are you sure?",
      "deleteInterviewConfirm": "This action cannot be undone. This will permanently delete this interview.",
      "deleteResponseConfirm": "This action cannot be undone. This will permanently delete this response.",
      "deleteQuestionConfirm": "This action cannot be undone. The question will be permanently deleted.",
      "cancel": "Cancel",
      "continue": "Continue",
      "delete": "Delete",
      "newQuestionPlaceholder": "Enter new question...",
      "addQuestionButton": "Add Question",
      "cancelButton": "Cancel",
      // Dashboard (ana sayfa) metinleri
      "dashboardTitle": "Overview",
      "dashboardSubtitle": "Welcome to the AI-powered interview platform. Here you can manage your interviews, evaluate candidates, and access detailed analytics.",
      "totalInterviewsCreated": "Total Interviews Created",
      "activeInterviews": "Active Interviews",
      "closedInterviews": "Inactive Interviews",
      "quickActions": "Quick Actions",
      "createInterview": "Create Interview",
      "browseInterviewers": "Browse Interviewers",
      "viewAllInterviews": "View All Interviews",
      "recentInterviews": "Recent Interviews",
      "viewAll": "View All",
      "noInterviewsCreated": "No interviews created yet",
      "createFirstInterview": "Create your first interview using the button above",
      "noResponsesYet": "No responses yet"
    }
  },
  tr: {
    translation: {
      "createInterviewTitle": "Görüşme Oluştur",
      "shareVia": "Paylaşım Yöntemi:",
      "link": "Bağlantı",
      "embed": "Göm",
      "copyUrl": "Bağlantıyı Kopyala",
      "copyEmbedCode": "Gömme Kodunu Kopyala",
      "width": "Genişlik (px)",
      "height": "Yükseklik (px)",
      "summary": "Özet",
      "share": "Paylaş",
      "edit": "Düzenle",
      "interviewersTitle": "Görüşmeciler",
      "interviewersSubtitle": "Profillerine tıklayarak onları tanıyabilirsiniz.",
      "myInterviewsTitle": "Görüşmelerim",
      "myInterviewsSubtitle": "Hemen yanıt almaya başlayın!",
      "createInterviewCard": "Görüşme Oluştur",
      "interviewName": "Görüşme Adı",
      "selectInterviewer": "Görüşmeci Seçin",
      "objective": "Amaç",
      "questionCount": "Soru Sayısı",
      "duration": "Süre (dk)",
      "generateQuestions": "Soruları Oluştur",
      "manualEntry": "Kendim Gireceğim",
      "question": "Soru",
      "depthLevel": "Derinlik Seviyesi",
      "low": "Düşük",
      "medium": "Orta",
      "high": "Yüksek",
      "addQuestion": "Soru Ekle",
      "interviewDescription": "Görüşme Açıklaması",
      "save": "Kaydet",
      "noteInterviewDescription": "Not: Görüşmeye katılanlar bu açıklamayı görecektir.",
      "responses": "Yanıt",
      "sidebarInterviews": "Görüşmeler",
      "sidebarInterviewers": "Görüşmeciler",
      "questionInfo": "Bu soruları görüşmelerde kullanacağız. Lütfen soruların uygun olduğundan emin olun.",
      "questionLabel": "Soru",
      "placeholderInterviewName": "örn. Görüşmenin Adı",
      "placeholderObjective": "örn. Adayların teknik becerilerini ve önceki projelerini değerlendirin.",
      "summaryTab": "Özet",
      "active": "Aktif",
      "filter": "Filtrele",
      "all": "Tümü",
      "responsesTab": "Yanıtlar",
      "generalEvaluation": "Genel Değerlendirme",
      "interviewer": "Görüşmeci",
      "responseStats": "Yanıt İstatistikleri",
      "totalResponses": "Toplam Yanıt",
      "completed": "Tamamlanan",
      "candidateStatus": "Aday Durumu",
      "selected": "Seçildi",
      "potential": "Potansiyel",
      "notSelected": "Seçilmedi",
      "averageDuration": "Ortalama Süre",
      "minutes": "Dakika",
      "name": "İsim",
      "overallScore": "Genel Puanlama",
      "communicationScore": "İletişim Puanı",
      "inactive": "İnaktif",
      "responseOf": "{{name}} Cevabı",
      "backToSummary": "Özete Dön",
      "placeholderInterviewDescription": "Görüşme açıklamasını buraya girin.",
      "questions": "Sorular",
      "recording": "Görüşme Kaydı",
      "generalSummary": "Genel Özet",
      "generalScore": "Genel Puan",
      "communication": "İletişim",
      "userSentiment": "Kullanıcı Duygusu",
      "interviewSummary": "Görüşme Özeti",
      "transcript": "Transkript",
      "feedback": "Geri Bildirim",
      "congratulations": "Tebrikler görüşmeye katıldınız.",
      "endOfInterview": "Görüşmeyi sonlandırıyorum. Katıldığınız için teşekkürler!",
      "aiInterviewer": "AI görüşmeci",
      "user": "Kullanıcı",
      "questionSummary": "Soru Özeti",
      "minuteShort": "dk",
      "secondShort": "sn",
      "noStatus": "Durum Yok",
      "userFeedback": "Kullanıcı Geri Bildirimi",
      "satisfactionLevel": "Memnuniyet Seviyesi",
      "satisfactionNote": "Görüşme sonrası kullanıcı geri bildirimine dayalı",
      "writtenFeedback": "Yazılı Geri Bildirim",
      "noFeedbackProvided": "Kullanıcı tarafından geri bildirim sağlanmadı",
      "moderate": "Orta",
      "good": "İyi",
      "bad": "Kötü",
      "noFeedbackGiven": "Geri bildirim sağlanmadı",
      "noWrittenComment": "Yazılı yorum sağlanmadı",
      // Pop-up translations
      "areYouSure": "Emin misiniz?",
      "deleteInterviewConfirm": "Bu işlem geri alınamaz. Bu görüşmeyi kalıcı olarak silecektir.",
      "deleteResponseConfirm": "Bu işlem geri alınamaz. Bu yanıtı kalıcı olarak silecektir.",
      "deleteQuestionConfirm": "Bu işlem geri alınamaz. Soru kalıcı olarak silinecek.",
      "cancel": "Vazgeç",
      "continue": "Devam Et",
      "delete": "Sil",
      "newQuestionPlaceholder": "Yeni soru girin...",
      "addQuestionButton": "Soru Ekle",
      "cancelButton": "İptal",
      // Dashboard (ana sayfa) metinleri
      "dashboardTitle": "Genel Bakış",
      "dashboardSubtitle": "AI destekli görüşme platformuna hoş geldiniz. Burada görüşmelerinizi yönetebilir, adayları değerlendirebilir ve ayrıntılı analizlere erişebilirsiniz.",
      "totalInterviewsCreated": "Toplam Oluşturulan Görüşmeler",
      "activeInterviews": "Aktif Görüşmeler", 
      "closedInterviews": "İnaktif Görüşmeler",
      "quickActions": "Hızlı Aksiyonlar",
      "createInterview": "Görüşme Oluştur",
      "browseInterviewers": "Görüşmecilere Gözat",
      "viewAllInterviews": "Tüm Görüşmeleri Gör",
      "recentInterviews": "Son Görüşmeler", 
      "viewAll": "Tümünü Gör",
      "noInterviewsCreated": "Henüz görüşme oluşturulmamış",
      "createFirstInterview": "İlk görüşmenizi oluşturmak için yukarıdaki butonu kullanın",
      "noResponsesYet": "Henüz yanıt yok"
      // ... diğer Türkçe metinler
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined' ? localStorage.getItem('lang') || 'tr' : 'tr',
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 
 