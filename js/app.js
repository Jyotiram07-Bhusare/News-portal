/**
 * LOKMANGAL NEWS PORTAL (लोकमंगल न्यूज पोर्टल)
 * JavaScript Engine for 3-Column Xapify Architecture
 */

// --- Articles Dataset ---
const articlesData = [
  {
    id: 1,
    title: "विधानसभा निवडणूक रणनीती: विविध पक्षांच्या प्रमुख नेत्यांच्या दौऱ्यांवर भर",
    category: "rajkiy",
    categoryLabel: "राजकीय",
    author: "लोकमंगल विशेष ब्युरो",
    date: "१२ ऑक्टोबर २०२६",
    image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80",
    excerpt: "आगामी विधानसभा निवडणुकीच्या पार्श्वभूमीवर राज्यातील राजकीय हालचालींना प्रचंड वेग आला आहे. प्रमुख पक्षांनी अंतर्गत बैठकांचा धडाका लावला असून उमेदवारांची चाचपणी सुरू केली आहे.",
    content: `
      <p><strong>मुंबई:</strong> आगामी विधानसभा निवडणुकीच्या पार्श्वभूमीवर राज्यातील राजकीय हालचालींना प्रचंड वेग आला आहे. सत्ताधारी आणि विरोधक या दोघांनीही जनसंपर्क मोहीम तीव्र केली असून प्रमुख नेत्यांचे राज्यव्यापी दौरे सुरू झाले आहेत.</p>
      <p>राजकीय विश्लेषकांच्या मते, यावेळची लढत अत्यंत चुरशीची ठरणार आहे. विशेषतः स्थानिक प्रश्न, शेतीमालाचे भाव, बेरोजगारी आणि पायाभूत सुविधांचा विकास हे मुद्दे निवडणुकीच्या केंद्रस्थानी राहणार आहेत.</p>
      <p>लोकमंगल न्यूजच्या विशेष प्रतिनिधींनी घेतलेल्या आढाव्यानुसार, ग्रामीण भागातील तरुण मतदार निर्णायक ठरणार आहेत. त्यामुळे प्रत्येक पक्षाकडून डिजिटल प्रचारावरही भर दिला जात आहे.</p>
    `,
    views: "14.2K"
  },
  {
    id: 2,
    title: "ग्रामीण महिला सक्षमीकरणासाठी बचत गटांच्या उत्पादनांना मिळाले आंतरराष्ट्रीय मार्केट",
    category: "samajik",
    categoryLabel: "सामाजिक",
    author: "स्नेहल पाटील (सामाजिक प्रतिनिधी)",
    date: "१२ ऑक्टोबर २०२६",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    excerpt: "जिल्ह्यातील ग्रामीण भागातील महिला बचत गटांनी तयार केलेल्या सेंद्रिय उत्पादने व हस्तकलेला ई-कॉमर्स प्लॅटफॉर्मवर मोठी मागणी मिळत असून शेकडो कुटुंबांना आर्थिक स्थैर्य लाभले आहे.",
    content: `
      <p><strong>पुणे:</strong> ग्रामीण भागातील महिलांनी एकत्र येऊन सुरू केलेल्या बचत गटांच्या क्रांतीने नवी दिशा दाखवली आहे. लोकमंगल फाउंडेशन व स्थानिक प्रशासनाच्या सहकार्याने महिलांच्या उत्पादनांना जागतिक बाजारपेठ उपलब्ध झाली आहे.</p>
      <p>हस्तकला, सेंद्रिय कडधान्ये, पारंपरिक मसाले आणि खादी कापडाचे उत्पादन घेणाऱ्या २० हून अधिक बचत गटांनी गेल्या सहा महिन्यांत १ कोटींहून अधिक उलाढाल केली आहे.</p>
    `,
    views: "9.8K"
  },
  {
    id: 3,
    title: "लोकमंगल साप्ताहिक विशेषांक (अंक ४२): 'महाराष्ट्राचा विकासाचा महामार्ग आणि नवी आव्हाने'",
    category: "weekly",
    categoryLabel: "साप्ताहिक आवृत्ती",
    author: "संपादकीय मंडळ",
    date: "१२ ऑक्टोबर २०२६",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
    excerpt: "या आठवड्याच्या लोकमंगल साप्ताहिकात वाचा: उद्योग, शेती आणि शिक्षण क्षेत्रातील आमूलाग्र बदल, विशेष स्तंभलेख आणि थेट लोकप्रतिनिधींशी संवाद. मोफत ई-पेपर डाऊनलोड करा.",
    content: `
      <p><strong>लोकमंगल साप्ताहिक आवृत्ती (अंक ४२):</strong> प्रिय वाचकांनो, या आठवड्याचा विशेष अंक आता डिजिटल स्वरूपात उपलब्ध झाला आहे. राज्याच्या आर्थिक, सामाजिक आणि राजकीय स्थितीचा सखोल वेध घेणारे हे अंक वाचकांसाठी संग्राह्य ठरणार आहे.</p>
    `,
    views: "22.5K"
  },
  {
    id: 4,
    title: "ब्लॉग: 'डिजिटल युगातील समाजमन आणि वाचन संस्कृतीचे बदलते स्वरूप'",
    category: "blogs",
    categoryLabel: "ब्लॉग्स",
    author: "प्रा. डॉ. प्रकाश जोशी",
    date: "११ ऑक्टोबर २०२६",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
    excerpt: "सोशल मीडियाच्या रील्स आणि छोट्या व्हिडिओंच्या गर्दीत सखोल वाचन आणि चिंतन लोप पावत आहे का? यावर सुप्रसिद्ध विचारवंत आणि लेखकाचे वैचारिक मंथन.",
    content: `
      <p>माणसाचा मेंदू माहितीचा प्रचंड भडिमार सहन करतो आहे. परंतु माहिती म्हणजे ज्ञान नव्हे, हे आपण विसरत चाललो आहोत. आजच्या काळात पुस्तके, वृत्तपत्रे आणि वैचारिक ब्लॉग्स हेच आपल्या विवेकबुद्धीला जागृत ठेवण्याचे साधन आहेत.</p>
    `,
    views: "7.1K"
  },
  {
    id: 5,
    title: "मंत्रिमंडळाची महत्त्वपूर्ण बैठक: शेतकरी कर्ज सवलत व सिंचन प्रकल्पांना भरीव निधी मंजूर",
    category: "rajkiy",
    categoryLabel: "राजकीय",
    author: "राजकीय ब्युरो",
    date: "११ ऑक्टोबर २०२६",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    excerpt: "मंत्रालयात झालेल्या मंत्रिमंडळ बैठकीत मराठवाडा आणि विदर्भातील प्रलंबित सिंचन प्रकल्पांना गती देण्यासाठी २,५०० कोटी रुपयांच्या पुरवणी निधीला तत्त्वतः मंजुरी देण्यात आली.",
    content: `
      <p><strong>मुंबई:</strong> आज सह्याद्री अतिथीगृहावर पार पडलेल्या राज्य मंत्रिमंडळाच्या बैठकीत अनेक लोककल्याणकारी निर्णयांवर शिक्कामोर्तब करण्यात आले.</p>
    `,
    views: "11.4K"
  },
  {
    id: 6,
    title: "सोलापूर व मराठवाड्यातील दुष्काळी भागात पाण्याचे पुनर्भरण; ग्रामस्थांचा श्रमदानातून आदर्श",
    category: "samajik",
    categoryLabel: "सामाजिक",
    author: "आनंद मोहिते",
    date: "१० ऑक्टोबर २०२६",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    excerpt: "पाणीटंचाईवर मात करण्यासाठी १० गावांतील ग्रामस्थांनी एकत्र येत ५० पेक्षा अधिक बंधारे श्रमदानातून बांधले; भूजल पातळीत ३ फुटांची लक्षणीय वाढ.",
    content: `
      <p><strong>सोलापूर:</strong> स्वावलंबन आणि एकजुटीच्या जोरावर दुष्काळावर मात करता येते, याचे ज्वलंत उदाहरण सोलापूर जिल्ह्यातील गावांनी घालून दिले आहे.</p>
    `,
    views: "8.6K"
  },
  {
    id: 7,
    title: "ब्लॉग: 'स्थानिक स्वराज संस्था आणि सामान्य नागरिकांचे अधिकार'",
    category: "blogs",
    categoryLabel: "ब्लॉग्स",
    author: "अ‍ॅड. महेश देसाई",
    date: "०९ ऑक्टोबर २०२६",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    excerpt: "आपल्या परिसरातील नागरी समस्या, नगरपरिषद किंवा ग्रामपंचायतीकडून विकासकामांचे उत्तरदायित्व कसे मागवावे? माहिती अधिकार कायद्याचा योग्य वापर समजून घ्या.",
    content: `
      <p>स्थानिक स्वराज संस्था ही लोकशाहीची पहिली पायरी आहे. रस्ते, पाणी, स्वच्छता आणि आरोग्य या मूलभूत हक्कांसाठी नागरिकांनी सजग असणे अत्यंत आवश्यक आहे.</p>
    `,
    views: "6.3K"
  },
  {
    id: 8,
    title: "लोकमंगल साप्ताहिक आवृत्ती (अंक ४१): 'युवा शक्ती आणि कौशल्य विकास विशेष'",
    category: "weekly",
    categoryLabel: "साप्ताहिक आवृत्ती",
    author: "संपादकीय मंडळ",
    date: "०५ ऑक्टोबर २०२६",
    image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
    excerpt: "मागील आठवड्याचा विशेषांक ज्यामध्ये नवीन स्टार्ट-अप्स, शासकीय योजना, करिअर मार्गदर्शन आणि स्पर्धा परीक्षा तयारीचा आढावा देण्यात आला आहे.",
    content: `
      <p><strong>लोकमंगल साप्ताहिक आवृत्ती (अंक ४१):</strong> युवकांसाठी मार्गदर्शक ठरलेला हा अंक वाचकांच्या पसंतीस उतरला होता.</p>
    `,
    views: "18.9K"
  },
  {
    id: 9,
    title: "चित्रपट रिव्ह्यू: 'महाराष्ट्राची लोकसंस्कृती' - अस्सल मातीतील कलाकृती आणि दिग्दर्शनाची जादू",
    category: "review",
    categoryLabel: "रिव्ह्यू",
    author: "समीर कुलकर्णी (सिने समीक्षक)",
    date: "१२ ऑक्टोबर २०२६",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    excerpt: "नुकताच प्रदर्शित झालेला 'महाराष्ट्राची लोकसंस्कृती' हा चित्रपट ग्रामीण वास्तव आणि लोककलेचा सुंदर संगम घडवून आणतो. वाचा सविस्तर परीक्षण.",
    content: `
      <p><strong>सिनेमा परीक्षण:</strong> 'महाराष्ट्राची लोकसंस्कृती' हा चित्रपट केवळ एक मनोरंजन नसून आपल्या समृद्ध परंपरेचा आरसा आहे. उत्कृष्ट अभिनय, वास्तववादी दिग्दर्शन आणि अप्रतिम संगीत यामुळे हा चित्रपट प्रेक्षकांना खिळवून ठेवतो.</p>
      <p><strong>सकारात्मक बाजू:</strong> कलाकारांचा जिवंत अभिनय, अस्सल ग्रामीण बोलीभाषा आणि मनमोहक छायाचित्रण.</p>
      <p><strong>अंतिम निकाल:</strong> कुटुंबासह पाहण्यासारखा एक दर्जेदार आणि विचार करायला लावणारा चित्रपट! रेटिंग: ४.८/५ ★</p>
    `,
    views: "16.8K"
  },
  {
    id: 10,
    title: "गॅजेट रिव्ह्यू: आधुनिक शेतीसाठी उपयुक्त 'अ‍ॅग्रोटेक स्मार्ट ड्रोन'चे सखोल परीक्षण",
    category: "review",
    categoryLabel: "रिव्ह्यू",
    author: "टेक डेस्क",
    date: "११ ऑक्टोबर २०२६",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    excerpt: "कमी वेळेत कीटकनाशक फवारणी आणि पिकांच्या आरोग्याची अचूक माहिती देणारे हे ड्रोन शेतकऱ्यांसाठी किती फायदेशीर ठरते? जाणून घ्या.",
    content: `
      <p><strong>तंत्रज्ञान परीक्षण:</strong> भारतीय कृषी क्षेत्रात ड्रोन तंत्रज्ञानाचा वापर झपाट्याने वाढत आहे. 'अ‍ॅग्रोटेक स्मार्ट ड्रोन' हे प्रगत सेन्सर्स आणि दमदार बॅटरी क्षमतेसह येते.</p>
      <p>एका चार्जमध्ये १५ एकर क्षेत्र कव्हर करण्याची क्षमता या ड्रोनमध्ये आहे. लहान व मध्यम शेतकऱ्यांसाठी हे ड्रोन अत्यंत उपयुक्त ठरेल.</p>
    `,
    views: "12.3K"
  },
  {
    id: 11,
    title: "पुस्तक रिव्ह्यू: 'शिवकालीन अर्थव्यवस्था आणि प्रशासन' - अभ्यासकांसाठी अनमोल ठेवा",
    category: "review",
    categoryLabel: "रिव्ह्यू",
    author: "डॉ. मुकुंद दातार",
    date: "१० ऑक्टोबर २०२६",
    rating: "5.0",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    excerpt: "छत्रपती शिवाजी महाराजांच्या प्रगत आर्थिक व शेतीविषयक नीतीवर प्रकाश टाकणारे हे अभ्यासपूर्ण पुस्तक प्रत्येकाने का वाचले पाहिजे?",
    content: `
      <p><strong>ग्रंथ परीक्षण:</strong> छत्रपती शिवाजी महाराजांचे केवळ युद्धकौशल्यासाठीच नव्हे, तर रयतेचे कल्याण करणाऱ्या आर्थिक नीतीसाठीही महत्त्व किती मोठे होते, हे या पुस्तकातून सविस्तर स्पष्ट होते.</p>
      <p>पुस्तकाची मांडणी, संदर्भ आणि ओघवती भाषा वाचकाला खिळवून ठेवते.</p>
    `,
    views: "9.5K"
  },
  {
    id: 12,
    title: "ऑटो रिव्ह्यू: ग्रामीण भागासाठी 'इलेक्ट्रिक कृषी ट्रॅक्टर' - बचत आणि दमदार ताकद",
    category: "review",
    categoryLabel: "रिव्ह्यू",
    author: "रोहन सावंत (ऑटो तज्ज्ञ)",
    date: "०९ ऑक्टोबर २०२६",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    excerpt: "डिझेलच्या वाढत्या दरांवर मात करणारा नवा ई-ट्रॅक्टर भारतीय शेतात कसा ठरतोय प्रभावी? वाचा सविस्तर परफॉर्मन्स रिपोर्ट.",
    content: `
      <p><strong>ऑटोमोबाईल परीक्षण:</strong> ग्रामीण भागात इंधन खर्चात ७०% बचत करण्याचा दावा करणाऱ्या नव्या इलेक्ट्रिक ट्रॅक्टरची आम्ही प्रत्यक्ष चाचणी घेतली.</p>
      <p>उत्कृष्ट टॉर्क आणि जलद चार्जिंगच्या सुविधेमुळे हा ट्रॅक्टर शेतकऱ्यांच्या पसंतीस उतरत आहे.</p>
    `,
    views: "14.1K"
  },
  {
    id: 13,
    title: "लोकमंगल साप्ताहिक विशेषांक (अंक ४०): 'शेतकरी समृद्धी, आधुनिक कृषी तंत्रज्ञान व जलसंधारण'",
    category: "weekly",
    categoryLabel: "साप्ताहिक आवृत्ती",
    author: "संपादकीय मंडळ",
    date: "२८ सप्टेंबर २०२६",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    excerpt: "खरीप हंगाम आढावा, ठिबक सिंचन योजना, शेतकरी उत्पादक कंपन्यांचे (FPC) यश आणि दुष्काळमुक्तीसाठीच्या उपाययोजनांचा सविस्तर विशेष रिपोर्ट. मोफत ई-पेपर डाऊनलोड करा.",
    content: `
      <p><strong>लोकमंगल साप्ताहिक आवृत्ती (अंक ४०):</strong> राज्यातील बळीराजासाठी हा अंक मार्गदर्शक ठरणारा आहे. शेतीमध्ये आधुनिक तंत्रज्ञानाचा वापर करून उत्पादन कसे वाढवावे यावर कृषी तज्ज्ञांचे मार्गदर्शन या अंकात प्रसिद्ध करण्यात आले आहे.</p>
      <p>दुष्काळग्रस्त भागातील जलसंधारण मॉडेल्स आणि शेतकऱ्यांच्या यशोगाथांचा समावेश या विशेषांकात आहे.</p>
    `,
    views: "19.4K"
  },
  {
    id: 14,
    title: "लोकमंगल साप्ताहिक आवृत्ती (अंक ३९): 'ग्रामीण महिला उद्योजकता आणि सहकाराची नवी दिशा'",
    category: "weekly",
    categoryLabel: "साप्ताहिक आवृत्ती",
    author: "संपादकीय मंडळ",
    date: "२१ सप्टेंबर २०२६",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    excerpt: "बचत गटांच्या माध्यमातून ग्रामीण महिलांनी उभी केलेली आर्थिक क्रांती, लघुउद्योगांसाठी वित्तपुरवठा आणि स्थानिक बाजारपेठेचे सक्षमीकरण यावरील विशेष अंक.",
    content: `
      <p><strong>लोकमंगल साप्ताहिक आवृत्ती (अंक ३९):</strong> महिला सक्षमीकरणाचा नवा अध्याय उलगडणारा हा अंक आहे. ग्रामीण भागातील महिलांनी बचत गटांच्या माध्यमातून सुरू केलेले यशस्वी व्यवसाय आणि त्यांची प्रेरणादायी वाटचाल यात मांडण्यात आली आहे.</p>
    `,
    views: "16.7K"
  },
  {
    id: 15,
    title: "लोकमंगल साप्ताहिक विशेषांक (अंक ३८): 'डिजिटल शिक्षण क्रांती आणि आरोग्य व्यवस्था सक्षमीकरण'",
    category: "weekly",
    categoryLabel: "साप्ताहिक आवृत्ती",
    author: "संपादकीय मंडळ",
    date: "१४ सप्टेंबर २०२६",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    excerpt: "ग्रामीण शाळांमध्ये डिजिटल फलक आणि संगणक प्रयोगशाळा, प्राथमिक आरोग्य केंद्रांचे आधुनिकीकरण व टेली-मेडिसिन सुविधांचा घेतलेला विशेष वेध.",
    content: `
      <p><strong>लोकमंगल साप्ताहिक आवृत्ती (अंक ३८):</strong> शिक्षण आणि आरोग्य हे समाजाच्या विकासाचे दोन महत्त्वाचे आधारस्तंभ आहेत. या क्षेत्रातील नवकल्पना आणि शासकीय योजनांचा सर्वंकष आढावा या अंकात घेतला आहे.</p>
    `,
    views: "21.1K"
  },
  {
    id: 16,
    title: "लोकमंगल साप्ताहिक आवृत्ती (अंक ३७): 'सहकार चळवळ, कृषी बाजारपेठ आणि ग्रामीण अर्थव्यवस्थेचे पुनरुज्जीवन'",
    category: "weekly",
    categoryLabel: "साप्ताहिक आवृत्ती",
    author: "संपादकीय मंडळ",
    date: "०७ सप्टेंबर २०२६",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
    excerpt: "सहकारी संस्था, शेतकरी बाजारपेठ आणि स्थानिक अर्थव्यवस्थेला बळ देणाऱ्या धोरणांवर ज्येष्ठ अभ्यासकांचे परखड विश्लेषण.",
    content: `
      <p><strong>लोकमंगल साप्ताहिक आवृत्ती (अंक ३७):</strong> महाराष्ट्रातील सहकार चळवळीने ग्रामीण अर्थव्यवस्थेला नेहमीच उभारी दिली आहे. काळाच्या ओघात या चळवळीने कोणती नवी आव्हाने पेलली पाहिजेत, यावर सखोल चर्चा करण्यात आली आहे.</p>
    `,
    views: "17.8K"
  }
];

// --- Past Weekly Publication Issues (Issues 36 down to 1: complete 42 issues repository) ---
const PAST_WEEKLY_ISSUES = [
  { no: 36, date: "३१ ऑगस्ट २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक ३६): 'पर्यावरण संवर्धन, वृक्षारोपण आणि नदी पुनरुज्जीवन'", img: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80", views: "15.4K", desc: "सह्याद्रीच्या कुशीतील निसर्ग संपदा, जलसंवर्धन आणि वृक्षलागवड मोहीम यावर विशेष संशोधन." },
  { no: 35, date: "२४ ऑगस्ट २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक ३५): 'स्वातंत्र्य अमृत महोत्सव: महाराष्ट्राचे स्वातंत्र्यसैनिक व योगदान'", img: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80", views: "19.8K", desc: "महाराष्ट्रातील क्रांतिकारकांचे कार्य, स्वातंत्र्यलढ्यातील योगदान आणि इतिहासाची पाने." },
  { no: 34, date: "१७ ऑगस्ट २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक ३४): 'लहान व मध्यम उद्योग (MSME) आणि ग्रामीण रोजगारनिर्मिती'", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80", views: "14.2K", desc: "ग्रामीण भागात उद्योग सुरू करण्यासाठी शासनाचे अर्थसाहाय्य आणि यशस्वी उद्योजकांच्या यशोगाथा." },
  { no: 33, date: "१० ऑगस्ट २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक ३३): 'सोलापूर चादर व हातमाग वस्त्रोद्योग: जागतिक भरारी'", img: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80", views: "16.1K", desc: "सोलापूरच्या प्रसिद्ध चादर व टेरीटॉवेल उद्योगाची निर्यात आणि विणकरांच्या समस्यांवर विशेष प्रकाश." },
  { no: 32, date: "०३ ऑगस्ट २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक ३२): 'पर्यटन विकास: सह्याद्रीची गडकोट मोहीम आणि ऐतिहासिक वारसा'", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", views: "18.3K" },
  { no: 31, date: "२७ जुलै २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक ३१): 'दुग्ध व्यवसाय, पशुसंवर्धन व शेतीपूरक व्यवसाय मार्गदर्शक'", img: "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=800&q=80", views: "13.9K" },
  { no: 30, date: "२० जुलै २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक ३०): 'आषाढी वारी विशेष: भक्ती, संस्कृती आणि सामाजिक समरसता'", img: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80", views: "24.5K" },
  { no: 29, date: "१३ जुलै २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक २९): 'पाणी अडवा, पाणी जिरवा: जलयुक्त शिवार यशोगाथा'", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80", views: "17.2K" },
  { no: 28, date: "०६ जुलै २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक २८): 'स्मार्ट शेती, सेंद्रिय खते आणि विषमुक्त अन्न चळवळ'", img: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80", views: "15.8K" },
  { no: 27, date: "२९ जून २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक २७): 'मराठवाडा व विदर्भ औद्योगिक विकास प्रकल्प विशेष आढावा'", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", views: "16.4K" },
  { no: 26, date: "२२ जून २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक २६): 'आंतरराष्ट्रीय योग दिन: आरोग्य आणि निरोगी जीवनशैली'", img: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80", views: "19.1K" },
  { no: 25, date: "१५ जून २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक २५): 'नवीन शैक्षणिक धोरण आणि ग्रामीण शाळांचे भवितव्य'", img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80", views: "14.7K" },
  { no: 24, date: "०८ जून २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक २४): 'पावसाळा पूर्वतयारी, आपत्ती व्यवस्थापन व शेती नियोजन'", img: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80", views: "13.5K" },
  { no: 23, date: "०१ जून २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक २३): 'मृग नक्षत्र आणि खरीप हंगाम पेरणी विशेष मार्गदर्शन'", img: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80", views: "18.0K" },
  { no: 22, date: "२५ मे २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक २२): 'सौर ऊर्जा प्रकल्प आणि शेतीसाठी मोफत वीज योजना'", img: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80", views: "16.6K" },
  { no: 21, date: "१८ मे २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक २१): 'लोकशाहीचा उत्सव: निवडणूक सुधारणा आणि नागरिकांचे हक्क'", img: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80", views: "15.3K" },
  { no: 20, date: "११ मे २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक २०): 'राष्ट्रीय तंत्रज्ञान दिवस: ग्रामीण भागात डिजिटल क्रांती'", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80", views: "17.9K" },
  { no: 19, date: "०४ मे २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक १९): 'महाराष्ट्र दिन व कामगार दिन विशेषांक: कामगार कल्याण'", img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80", views: "22.1K" },
  { no: 18, date: "२७ एप्रिल २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक १८): 'उन्हाळी पिके, भाजीपाला शेती आणि थेट बाजारपेठ'", img: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80", views: "14.0K" },
  { no: 17, date: "२० एप्रिल २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक १७): 'महात्मा जोतीराव फुले व डॉ. आंबेडकर विचार विशेषांक'", img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80", views: "20.4K" },
  { no: 16, date: "१३ एप्रिल २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक १६): 'गुढीपाडवा विशेषांक: नववर्ष आणि महाराष्ट्राची समृद्धी'", img: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80", views: "18.8K" },
  { no: 15, date: "०६ एप्रिल २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक १५): 'जल व्यवस्थापन, विहिरींचे पुनर्भरण आणि ठिबक सिंचन'", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", views: "16.2K" },
  { no: 14, date: "३० मार्च २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक १४): 'वित्तीय वर्ष अखेर: कर नियोजन, गुंतवणूक व शेतकरी बचत'", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80", views: "15.0K" },
  { no: 13, date: "२३ मार्च २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक १३): 'शहीद दिन: भगतसिंग, राजगुरू आणि सुखदेव यांची देशभक्ती'", img: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80", views: "19.5K" },
  { no: 12, date: "१६ मार्च २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक १२): 'जागतिक ग्राहक दिन: ग्राहक हक्क आणि ऑनलाईन सुरक्षा'", img: "https://images.unsplash.com/photo-1556742049-0a67e5572293?auto=format&fit=crop&w=800&q=80", views: "14.1K" },
  { no: 11, date: "०९ मार्च २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक ११): 'जागतिक महिला दिन विशेषांक: कर्तृत्ववान महिलांची यशोगाथा'", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80", views: "23.7K" },
  { no: 10, date: "०२ मार्च २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक १०): 'मराठी भाषा गौरव दिन विशेष: साहित्य, भाषा आणि संस्कृती'", img: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80", views: "17.4K" },
  { no: 9, date: "२३ फेब्रुवारी २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक ९): 'शिवजयंती विशेषांक: छत्रपती शिवाजी महाराजांचे जल व कृषी व्यवस्थापन'", img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80", views: "25.2K" },
  { no: 8, date: "१६ फेब्रुवारी २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक ८): 'कृषी औद्योगिक प्रदर्शन आणि आधुनिक शेती अवजारे'", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80", views: "15.6K" },
  { no: 7, date: "०९ फेब्रुवारी २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक ७): 'ग्रामीण बँकिंग, पतसंस्था आणि शेतकरी सुलभ कर्ज योजना'", img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80", views: "16.9K" },
  { no: 6, date: "०२ फेब्रुवारी २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक ६): 'अर्थसंकल्प विशेषांक: शेती, उद्योग आणि सर्वसामान्यांना दिलासा'", img: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80", views: "21.0K" },
  { no: 5, date: "२६ जानेवारी २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक ५): 'प्रजासत्ताक दिन विशेषांक: भारतीय संविधान, लोकशाही आणि कर्तव्ये'", img: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80", views: "20.8K" },
  { no: 4, date: "१९ जानेवारी २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक ४): 'मकर संक्रांती विशेष: शेतीतील समृद्धी आणि पारंपरिक सण'", img: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80", views: "16.3K" },
  { no: 3, date: "१२ जानेवारी २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक ३): 'स्वामी विवेकानंद व जिजाऊ जयंती: युवा प्रेरणा विशेषांक'", img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80", views: "19.9K" },
  { no: 2, date: "०५ जानेवारी २०२६", title: "लोकमंगल साप्ताहिक विशेषांक (अंक २): 'सावित्रीबाई फुले जयंती: स्त्री शिक्षणाची क्रांती'", img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80", views: "22.4K" },
  { no: 1, date: "०१ जानेवारी २०२६", title: "लोकमंगल साप्ताहिक आवृत्ती (अंक १): 'नवीन वर्ष विशेषांक २०२६: लोकमंगल साप्ताहिक शुभारंभ'", img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80", views: "26.0K" }
];

PAST_WEEKLY_ISSUES.forEach(item => {
  articlesData.push({
    id: 1000 + item.no,
    title: item.title,
    category: "weekly",
    categoryLabel: "साप्ताहिक आवृत्ती",
    author: "संपादकीय मंडळ",
    date: item.date,
    image: item.img,
    excerpt: item.desc || `लोकमंगल साप्ताहिक अंक ${item.no} चा विशेष डिजिटल ई-पेपर अंक उपलब्ध. शेती, उद्योग, समाजकारण आणि विशेष स्तंभांचा संग्रह. मोफत PDF डाऊनलोड करा.`,
    content: `<p><strong>लोकमंगल साप्ताहिक अंक ${item.no}:</strong> प्रिय वाचकांनो, हा अंक आता डिजिटल स्वरूपात उपलब्ध आहे. सविस्तर वाचनासाठी ई-पेपर डाऊनलोड करा किंवा ऑनलाईन वाचा.</p>`,
    views: item.views
  });
});

// --- Weekly issues -----------------------------------------------------------------------------------
// Devanagari digits <-> plain numbers (the issue number lives inside the Marathi title: "अंक ४२")
const DEV_DIGITS = "०१२३४५६७८९";
const devToAscii = (s) => String(s).replace(/[०-९]/g, (d) => DEV_DIGITS.indexOf(d));
const toDevanagari = (n) => String(n).replace(/\d/g, (d) => DEV_DIGITS[d]);

articlesData.forEach((a) => {
  if (a.category !== "weekly") return;
  const m = a.title.match(/अंक\s*([०-९0-9]+)/);
  a.issue = m ? parseInt(devToAscii(m[1]), 10) : null;
});

const weeklyIssues = () => articlesData.filter((a) => a.category === "weekly" && a.issue).sort((a, b) => b.issue - a.issue);
const latestIssue = () => weeklyIssues()[0];
const issueByNo = (no) => articlesData.find((a) => a.category === "weekly" && a.issue === no);

// Every issue has ONE pdf:  assets/pdf/lokmangal-weekly-<issue number>.pdf
// (the files that ship now are SAMPLES - overwrite them with the real issues using the same file names;
//  an article can also carry its own  pdf: "assets/pdf/xyz.pdf"  property)
const pdfUrlFor = (a) => a.pdf || `assets/pdf/lokmangal-weekly-${a.issue}.pdf`;
const NEWS_CATEGORIES = ["samajik", "rajkiy"];   // the "News" menu = Samajik + Rajkiy

// Search understands both digit styles: "२५" and "25" find the same issue
const searchKey = (s) => devToAscii(String(s).toLowerCase());
function findArticleByQuery(q) {
  const k = searchKey(q);
  return articlesData.find((a) => searchKey(a.title).includes(k) || searchKey(a.excerpt).includes(k));
}

// Current State (the router below sets these for every view)
let currentCategory = "all";
let mainStoryId = latestIssue().id;   // the latest Weekly Publication issue

// --- Image helpers: ask the image CDN for the size a slot really needs (saves a lot of mobile data) ---
const LAZY_IMG = 'loading="lazy" decoding="async"';
const HERO_IMG_ATTRS = 'decoding="async" fetchpriority="high"';

// Unsplash URLs carry a width parameter (w=800). Swap in the width we need; other URLs pass through untouched.
function imgW(url, w) {
  return /[?&]w=\d+/.test(url) ? url.replace(/([?&])w=\d+/, `$1w=${w}`) : url;
}

// Small thumbnail (list rows, grids): fixed width, lazy loaded
function thumbImg(url, alt, w) {
  return `<img src="${imgW(url, w)}" alt="${alt}" ${LAZY_IMG} />`;
}

// Large image with srcset, so phones fetch ~480px and big screens the bigger file
function fluidImg(url, alt, widths, sizes, attrs = LAZY_IMG) {
  if (!/[?&]w=\d+/.test(url)) return `<img src="${url}" alt="${alt}" ${attrs} />`;
  const mid = widths[Math.floor(widths.length / 2)];
  const srcset = widths.map(w => `${imgW(url, w)} ${w}w`).join(", ");
  return `<img src="${imgW(url, mid)}" srcset="${srcset}" sizes="${sizes}" alt="${alt}" ${attrs} />`;
}

// First paragraph of an article as a well-formed teaser. (The old content.substring(0, 280) could cut
// straight through an HTML tag and always printed "..." even when nothing was cut.)
function teaserHTML(content, max = 280) {
  const m = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const inner = (m ? m[1] : content).trim();
  const plain = inner.replace(/<[^>]*>/g, "").trim();
  if (plain.length <= max) return inner;
  return plain.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

// Initialize on Load
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initNavigation();
  initSearch();
  initDrawerSearch();
  initDrawerSwipe();
  initSheetSwipe();
  initFollowPlacement();
  renderLabelCounts();
  renderLeftSidebar();
  renderRightSidebar();
  renderLatestReviews();
  renderFeaturedVideos();
  // (the slide-out "Popular Items" list is rendered the first time the menu opens - see openDrawer)

  initRouter();   // draws the view that matches the address (Home when there is no #hash)
  initBackToTop();
});

// "सर्व बातम्या (१६)"-style counters in the Labels widget come from the data, not from typed numbers
function renderLabelCounts() {
  const count = (cat) => (cat === "all" ? articlesData.length : articlesData.filter((a) => a.category === cat).length);
  document.querySelectorAll(".label-count[data-count]").forEach((el) => {
    el.textContent = `(${toDevanagari(count(el.dataset.count))})`;
  });
}

// --- Theme Switch ---
function initThemeToggle() {
  const btn = document.getElementById("theme-toggle-btn");
  const html = document.documentElement;

  let savedTheme = null;
  try { savedTheme = localStorage.getItem("lokmangal-theme"); } catch (e) { /* storage blocked */ }

  if (savedTheme === "dark") {
    html.classList.add("is-dark");
    if (btn) btn.innerHTML = `<i class="fa-solid fa-sun"></i>`;
  }
  setThemeColorMeta(html.classList.contains("is-dark"));

  if (btn) {
    btn.addEventListener("click", () => {
      const isDark = html.classList.toggle("is-dark");
      try { localStorage.setItem("lokmangal-theme", isDark ? "dark" : "light"); } catch (e) { /* storage blocked */ }
      btn.innerHTML = isDark ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-regular fa-moon"></i>`;
      setThemeColorMeta(isDark);
      showToast(isDark ? "डार्क मोड सुरू केला" : "लाईट मोड सुरू केला");
    });
  }
}

// Phone browser bar colour follows the header (white / dark)
function setThemeColorMeta(isDark) {
  const meta = document.getElementById("meta-theme-color");
  if (meta) meta.setAttribute("content", isDark ? "#202020" : "#ffffff");
}

// --- Navigation & Dropdown Handling ---
// --- Slide-out menu (hamburger) ---
let drawerPopularRendered = false;

function isDrawerOpen() {
  const drawer = document.getElementById("mobile-drawer");
  return !!drawer && drawer.classList.contains("open");
}

// One place decides whether the page behind the menu / a bottom sheet may scroll
window.syncScrollLock = function() {
  const sheetOpen = !!document.querySelector(".modal-overlay.active");
  document.documentElement.classList.toggle("scroll-locked", isDrawerOpen() || sheetOpen);
};

// --- Back button / back-swipe closes an open menu or sheet instead of leaving the page ---
// Opening the menu or a sheet pushes ONE history entry (same URL). Back then pops it and we just close the
// overlay. Closing through the UI pops that entry again, so the next Back behaves normally. Touch layouts only.
let overlayHistory = 0;            // 0 = nothing pushed · 1 = entry pushed for the open overlay · 2 = going back after a UI close
let afterHistorySettles = [];

const touchLayout = () => window.matchMedia("(max-width: 980px), (hover: none)").matches;
const anyOverlayOpen = () => isDrawerOpen() || !!document.querySelector(".modal-overlay.active");

function pushOverlayHistory() {
  if (overlayHistory !== 0 || !touchLayout()) return;
  history.pushState({ lokmangalOverlay: true }, "");
  overlayHistory = 1;
}

function releaseOverlayHistory() {
  if (overlayHistory !== 1 || anyOverlayOpen()) return;
  overlayHistory = 2;
  history.back();
  setTimeout(settleHistory, 600);  // safety net — popstate normally arrives within a few ms
}

function settleHistory() {
  if (overlayHistory === 2) overlayHistory = 0;
  const jobs = afterHistorySettles;
  afterHistorySettles = [];
  jobs.forEach((job) => job());
}

// History changes (e.g. the #post-N hash) must wait until the "pop the overlay entry" step has finished
function whenHistorySettled(job) {
  if (overlayHistory === 2) afterHistorySettles.push(job);
  else job();
}

window.addEventListener("popstate", (e) => {
  if (overlayHistory === 2) {
    settleHistory();
  } else if (overlayHistory === 1) {  // Back pressed while a menu / sheet was open
    overlayHistory = 0;
    closeDrawer(true);
    closeModals(true);
  } else if (e.state && e.state.lokmangalOverlay) {
    // Forward into a stale "menu was open" entry: nothing to show, stay on the current view
  } else if (currentRouteKey() !== renderedRoute) {   // ordinary Back / Forward between views
    renderRoute({ scroll: false, restoreY: e.state && typeof e.state.y === "number" ? e.state.y : 0 });
  }
});

window.openDrawer = function() {
  const drawer = document.getElementById("mobile-drawer");
  const overlay = document.getElementById("drawer-overlay");
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  if (!drawer || !overlay) return;

  // "Popular Items" images are only fetched when the menu is actually opened
  if (!drawerPopularRendered) {
    renderDrawerPopularItems();
    drawerPopularRendered = true;
  }

  drawer.classList.add("open");
  overlay.classList.add("open");
  if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "true");
  syncScrollLock();
  pushOverlayHistory();
};

window.closeDrawer = function(silent) {
  const drawer = document.getElementById("mobile-drawer");
  const overlay = document.getElementById("drawer-overlay");
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  if (drawer) drawer.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
  if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
  syncScrollLock();
  if (silent !== true) releaseOverlayHistory();
};

function closeSearchBar() {
  const bar = document.getElementById("search-overlay-bar");
  if (bar) bar.classList.remove("show");
}

// Swipe the open menu to the left to close it (like a native app drawer)
function initDrawerSwipe() {
  const drawer = document.getElementById("mobile-drawer");
  if (!drawer) return;

  let startX = 0, startY = 0, dx = 0, tracking = false, axis = null;

  drawer.addEventListener("touchstart", (e) => {
    if (!isDrawerOpen() || e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    dx = 0;
    axis = null;
    tracking = true;
  }, { passive: true });

  drawer.addEventListener("touchmove", (e) => {
    if (!tracking) return;
    const mx = e.touches[0].clientX - startX;
    const my = e.touches[0].clientY - startY;
    if (axis === null && (Math.abs(mx) > 8 || Math.abs(my) > 8)) {
      axis = Math.abs(mx) > Math.abs(my) * 1.4 ? "x" : "y";
    }
    if (axis !== "x") return;
    dx = Math.min(0, mx);
    drawer.style.transition = "none";
    drawer.style.transform = `translateX(${dx}px)`;
  }, { passive: true });

  const finish = () => {
    if (!tracking) return;
    tracking = false;
    drawer.style.transition = "";
    drawer.style.transform = "";
    if (axis === "x" && dx < -70) closeDrawer();
  };
  drawer.addEventListener("touchend", finish);
  drawer.addEventListener("touchcancel", finish);
}

// Bottom-sheet modals on phones: drag the title bar down to dismiss
function initSheetSwipe() {
  const isPhone = () => window.matchMedia("(max-width: 600px)").matches;

  document.querySelectorAll(".modal-overlay .modal-header-bar").forEach((bar) => {
    const card = bar.closest(".modal-card");
    let startY = 0, dy = 0, dragging = false;

    bar.addEventListener("touchstart", (e) => {
      if (!isPhone() || e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      dy = 0;
      dragging = true;
    }, { passive: true });

    bar.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      dy = Math.max(0, e.touches[0].clientY - startY);
      card.style.transition = "none";
      card.style.transform = `translateY(${dy}px)`;
    }, { passive: true });

    const finish = () => {
      if (!dragging) return;
      dragging = false;
      card.style.transition = "";
      card.style.transform = "";
      if (dy > 90) closeModals();
    };
    bar.addEventListener("touchend", finish);
    bar.addEventListener("touchcancel", finish);
  });
}

// "Follow Us" sits in the right column on desktop. Where the sidebars stack (phones / tablets) it belongs
// directly under the Labels widget, so the very same element is moved there (and back) — nothing is duplicated.
function initFollowPlacement() {
  const follow = document.getElementById("widget-follow");
  const labels = document.getElementById("widget-labels");
  const videos = document.getElementById("widget-videos");
  if (!follow || !labels || !videos) return;

  const stacked = window.matchMedia("(max-width: 980px)");
  const place = () => {
    if (stacked.matches) {
      if (labels.nextElementSibling !== follow) labels.after(follow);
    } else if (videos.previousElementSibling !== follow) {
      videos.before(follow);
    }
  };

  place();
  if (stacked.addEventListener) stacked.addEventListener("change", place);
  else if (stacked.addListener) stacked.addListener(place);   // older Safari
}

// --- Navigation & Dropdown Handling ---
function initNavigation() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const overlay = document.getElementById("drawer-overlay");
  const closeBtn = document.getElementById("drawer-close-btn");

  if (toggleBtn) toggleBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);

  // "News" accordion inside the slide-out menu
  const newsGroup = document.getElementById("drawer-news-group");
  const newsToggle = document.getElementById("drawer-news-toggle");
  if (newsGroup && newsToggle) {
    newsToggle.addEventListener("click", () => {
      const open = newsGroup.classList.toggle("open");
      newsToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Click toggle for dropdown on touch/mobile
  const newsItem = document.querySelector(".nav-item.has-dropdown");
  if (newsItem) {
    newsItem.querySelector(".nav-link").addEventListener("click", (e) => {
      e.preventDefault();
      newsItem.classList.toggle("open-dropdown");
    });

    document.addEventListener("click", (e) => {
      if (!newsItem.contains(e.target)) {
        newsItem.classList.remove("open-dropdown");
      }
    });
  }
}

// Global Category Filter — every section has its own address (#weekly, #cat-rajkiy ...), so Back, Forward,
// refresh and shared links all behave. "all" = Home.
window.setCategoryFilter = function(category) {
  navigate(routeForCategory(category));
  showToast(`विभाग: ${getMarathiCategory(category)}`);
};

function updateNavActiveStates(category) {
  const inNewsMenu = category === "samajik" || category === "rajkiy";

  // Update nav active states (desktop header; "News" lights up for its Samajik / Rajkiy children)
  document.querySelectorAll(".nav-item").forEach(item => {
    const nav = item.getAttribute("data-nav");
    if (nav === category || (nav === "news" && inNewsMenu) || (category === "all" && nav === "home")) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Update labels active state
  document.querySelectorAll(".label-item").forEach(item => {
    item.classList.remove("active");
    if (item.getAttribute("onclick")?.includes(`'${category}'`)) {
      item.classList.add("active");
    }
  });

  // Phone category chips (kept in view while you swipe them)
  document.querySelectorAll(".chip").forEach(chip => {
    const on = chip.dataset.cat === category;
    chip.classList.toggle("active", on);
    if (on) chip.setAttribute("aria-current", "true");
    else chip.removeAttribute("aria-current");
  });
  const activeChip = document.querySelector(".chip.active");
  if (activeChip) centerChip(activeChip);

  // Slide-out menu
  document.querySelectorAll(".drawer-nav-link[data-cat]").forEach(link => {
    link.classList.toggle("active", link.dataset.cat === category);
  });
  const newsGroup = document.getElementById("drawer-news-group");
  const newsToggle = document.getElementById("drawer-news-toggle");
  if (newsGroup && inNewsMenu) {
    newsGroup.classList.add("open");
    if (newsToggle) newsToggle.setAttribute("aria-expanded", "true");
  }
}

// Scroll the chip strip sideways so the chosen chip sits in the middle
function centerChip(chip) {
  const track = chip.parentElement;
  if (!track || track.scrollWidth <= track.clientWidth + 1) return;
  const target = chip.offsetLeft - (track.clientWidth - chip.offsetWidth) / 2;
  track.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
}

function getMarathiCategory(cat) {
  switch(cat) {
    case "rajkiy": return "राजकीय (Rajkiy)";
    case "samajik": return "सामाजिक (Samajik)";
    case "weekly": return "साप्ताहिक आवृत्ती (Weekly)";
    case "blogs": return "ब्लॉग्स (Blogs)";
    case "review": return "रिव्ह्यू (Reviews)";
    default: return "होम (Home)";
  }
}

// --- Render Left Sidebar (Popular Posts matching Xapify) ---
function renderLeftSidebar() {
  const container = document.getElementById("popular-posts-container");
  if (!container) return;

  const item0 = articlesData[1]; // Samajik item
  const item1 = articlesData[0]; // Rajkiy item
  const item2 = articlesData[4]; // Minister item

  container.innerHTML = `
    <!-- Item 0 Large Card with Overlay -->
    <div class="popular-card-large" onclick="openArticleModal(${item0.id})">
      ${fluidImg(item0.image, item0.title, [480, 800], "(max-width: 600px) 100vw, 300px")}
      <div class="popular-card-overlay">
        <span class="category-tag-badge">${item0.categoryLabel}</span>
        <h4 class="popular-card-title">${item0.title}</h4>
        <div class="popular-card-byline">by ${item0.author} - ${item0.date}</div>
      </div>
    </div>

    <!-- Item 1 List Card -->
    <div class="popular-sub-item" onclick="openArticleModal(${item1.id})">
      <div class="popular-sub-thumb">
        ${thumbImg(item1.image, item1.title, 240)}
      </div>
      <div class="popular-sub-content">
        <h5 class="popular-sub-title">${item1.title}</h5>
        <span class="popular-sub-date">${item1.date}</span>
      </div>
    </div>

    <!-- Item 2 List Card -->
    <div class="popular-sub-item" onclick="openArticleModal(${item2.id})">
      <div class="popular-sub-thumb">
        ${thumbImg(item2.image, item2.title, 240)}
      </div>
      <div class="popular-sub-content">
        <h5 class="popular-sub-title">${item2.title}</h5>
        <span class="popular-sub-date">${item2.date}</span>
      </div>
    </div>
  `;
}

// --- Render Right Sidebar (Random Posts 2x2 Grid matching screenshot) ---
function renderRightSidebar() {
  const container = document.getElementById("random-posts-grid");
  if (!container) return;

  // 4 items for 2x2 grid
  const randomItems = [articlesData[1], articlesData[0], articlesData[3], articlesData[4]];

  container.innerHTML = randomItems.map(item => `
    <div class="random-grid-item" onclick="openArticleModal(${item.id})">
      <div class="random-grid-thumb">
        ${thumbImg(item.image, item.title, 400)}
      </div>
      <h5 class="random-grid-title">${item.title}</h5>
      <span class="random-grid-date">${item.date}</span>
    </div>
  `).join("");

}

// --- Render Latest Reviews (Matching Popular Posts Exactly: 4 items) ---
function renderLatestReviews() {
  const container = document.getElementById("latest-reviews-container");
  if (!container) return;

  const reviewArticles = articlesData.filter(a => a.category === "review");
  if (reviewArticles.length < 4) return;

  const item0 = reviewArticles[0]; // Cinema review (Large top card)
  const item1 = reviewArticles[1]; // Tech drone review (Sub item 1)
  const item2 = reviewArticles[2]; // Book review (Sub item 2)
  const item3 = reviewArticles[3]; // Auto tractor review (Sub item 3)

  container.innerHTML = `
    <!-- Item 0 Large Card with Overlay -->
    <div class="popular-card-large" onclick="openArticleModal(${item0.id})">
      ${fluidImg(item0.image, item0.title, [480, 800], "(max-width: 600px) 100vw, 300px")}
      <div class="popular-card-overlay">
        <span class="category-tag-badge">${item0.categoryLabel}</span>
        <h4 class="popular-card-title">${item0.title}</h4>
        <div class="popular-card-byline">
          by ${item0.author} - ${item0.date}
          <span class="review-rating-stars"><i class="fa-solid fa-star"></i> ${item0.rating}</span>
        </div>
      </div>
    </div>

    <!-- Item 1 List Card -->
    <div class="popular-sub-item" onclick="openArticleModal(${item1.id})">
      <div class="popular-sub-thumb">
        ${thumbImg(item1.image, item1.title, 240)}
      </div>
      <div class="popular-sub-content">
        <h5 class="popular-sub-title">${item1.title}</h5>
        <div class="popular-sub-date">
          ${item1.date}
          <span class="review-rating-stars"><i class="fa-solid fa-star"></i> ${item1.rating}</span>
        </div>
      </div>
    </div>

    <!-- Item 2 List Card -->
    <div class="popular-sub-item" onclick="openArticleModal(${item2.id})">
      <div class="popular-sub-thumb">
        ${thumbImg(item2.image, item2.title, 240)}
      </div>
      <div class="popular-sub-content">
        <h5 class="popular-sub-title">${item2.title}</h5>
        <div class="popular-sub-date">
          ${item2.date}
          <span class="review-rating-stars"><i class="fa-solid fa-star"></i> ${item2.rating}</span>
        </div>
      </div>
    </div>

    <!-- Item 3 List Card -->
    <div class="popular-sub-item" onclick="openArticleModal(${item3.id})">
      <div class="popular-sub-thumb">
        ${thumbImg(item3.image, item3.title, 240)}
      </div>
      <div class="popular-sub-content">
        <h5 class="popular-sub-title">${item3.title}</h5>
        <div class="popular-sub-date">
          ${item3.date}
          <span class="review-rating-stars"><i class="fa-solid fa-star"></i> ${item3.rating}</span>
        </div>
      </div>
    </div>
  `;
}

// --- Video Posts Dataset (4 Featured Videos) ---
const videoPostsData = [
  {
    id: "v1",
    title: "थेट ग्राऊंड रिपोर्ट: विदर्भातील शेतकरी समृद्धी जलसिंचन प्रकल्पाचा प्रत्यक्ष आढावा",
    author: "लोकमंगल विशेष वृत्त",
    duration: "०५:४२",
    views: "२८.५K व्ह्यूज",
    date: "१२ ऑक्टोबर २०२६",
    categoryLabel: "व्हिडिओ",
    thumbnail: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    description: "लोकमंगलच्या प्रतिनिधींनी दुष्काळी भागातील सिंचन कालव्यांची प्रत्यक्ष पाहणी केली. शेतकऱ्यांशी थेट संवाद साधून जलसंधारणाच्या कामांचे वास्तव मांडणारा विशेष व्हिडिओ रिपोर्ट."
  },
  {
    id: "v2",
    title: "मंत्रालयातील घडामोडी: मंत्रिमंडळ बैठकीनंतर नवीन उद्योग धोरणावर विशेष चर्चा",
    author: "मंत्रालय ब्युरो",
    duration: "०४:१५",
    views: "१९.२K व्ह्यूज",
    date: "११ ऑक्टोबर २०२६",
    categoryLabel: "व्हिडिओ",
    thumbnail: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    description: "सह्याद्री अतिथीगृहावर पार पडलेल्या महत्त्वपूर्ण बैठकीत ग्रामीण उद्योजकता आणि तरुणांसाठी स्वयंरोजगार योजनांबाबत घेतलेल्या निर्णयांची सविस्तर माहिती."
  },
  {
    id: "v3",
    title: "विशेष माहितीपट: सह्याद्रीतील ऐतिहासिक गडकिल्ले संवर्धन आणि पर्यटनाची नवी दिशा",
    author: "संस्कृती विशेष",
    duration: "०६:३०",
    views: "३४.७K व्ह्यूज",
    date: "१० ऑक्टोबर २०२६",
    categoryLabel: "व्हिडिओ",
    thumbnail: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
    description: "छत्रपती शिवाजी महाराजांच्या गडकिल्ल्यांचे ऐतिहासिक पावित्र्य जपणे आणि पर्यटकांमध्ये जबाबदारीचे भान निर्माण करण्यासाठी लोकमंगलचा माहितीपट."
  },
  {
    id: "v4",
    title: "तंत्रज्ञान व नवसंशोधन: ग्रामीण भागात सौरऊर्जेवर चालणाऱ्या कोल्ड स्टोरेजचा यशस्वी प्रयोग",
    author: "अ‍ॅग्रो टेक",
    duration: "०३:५०",
    views: "१५.८K व्ह्यूज",
    date: "०९ ऑक्टोबर २०२६",
    categoryLabel: "व्हिडिओ",
    thumbnail: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80",
    description: "नाशिकच्या प्रयोगशील शेतकऱ्यांनी तयार केलेले सौर शीतगृह कसे वाचवते भाजीपाला व फळांचे नुकसान? पाहा हा विशेष प्रात्यक्षिक व्हिडिओ."
  }
];

// --- Render Featured Videos (4 Posts with Play Buttons & Duration Badges) ---
function renderFeaturedVideos() {
  const container = document.getElementById("featured-videos-container");
  if (!container) return;

  const item0 = videoPostsData[0];
  const item1 = videoPostsData[1];
  const item2 = videoPostsData[2];
  const item3 = videoPostsData[3];

  container.innerHTML = `
    <!-- Item 0 Large Featured Video Card -->
    <div class="popular-card-large video-card-large" onclick="openVideoModal('v1')">
      ${fluidImg(item0.thumbnail, item0.title, [480, 800], "(max-width: 600px) 100vw, 300px")}
      <div class="video-play-center-btn" title="व्हिडिओ पाहा">
        <i class="fa-solid fa-play"></i>
      </div>
      <div class="video-duration-tag">
        <i class="fa-solid fa-video"></i> ${item0.duration}
      </div>
      <div class="popular-card-overlay">
        <span class="category-tag-badge video-badge">${item0.categoryLabel}</span>
        <h4 class="popular-card-title">${item0.title}</h4>
        <div class="popular-card-byline">
          <i class="fa-solid fa-eye"></i> ${item0.views} • ${item0.date}
        </div>
      </div>
    </div>

    <!-- Item 1 List Video Item -->
    <div class="popular-sub-item video-sub-item" onclick="openVideoModal('v2')">
      <div class="popular-sub-thumb video-sub-thumb">
        ${thumbImg(item1.thumbnail, item1.title, 240)}
        <div class="video-mini-play-overlay">
          <i class="fa-solid fa-play"></i>
        </div>
        <span class="video-mini-duration">${item1.duration}</span>
      </div>
      <div class="popular-sub-content">
        <h5 class="popular-sub-title">${item1.title}</h5>
        <div class="popular-sub-date">
          <span><i class="fa-solid fa-eye"></i> ${item1.views}</span>
          <span>• ${item1.date}</span>
        </div>
      </div>
    </div>

    <!-- Item 2 List Video Item -->
    <div class="popular-sub-item video-sub-item" onclick="openVideoModal('v3')">
      <div class="popular-sub-thumb video-sub-thumb">
        ${thumbImg(item2.thumbnail, item2.title, 240)}
        <div class="video-mini-play-overlay">
          <i class="fa-solid fa-play"></i>
        </div>
        <span class="video-mini-duration">${item2.duration}</span>
      </div>
      <div class="popular-sub-content">
        <h5 class="popular-sub-title">${item2.title}</h5>
        <div class="popular-sub-date">
          <span><i class="fa-solid fa-eye"></i> ${item2.views}</span>
          <span>• ${item2.date}</span>
        </div>
      </div>
    </div>

    <!-- Item 3 List Video Item -->
    <div class="popular-sub-item video-sub-item" onclick="openVideoModal('v4')">
      <div class="popular-sub-thumb video-sub-thumb">
        ${thumbImg(item3.thumbnail, item3.title, 240)}
        <div class="video-mini-play-overlay">
          <i class="fa-solid fa-play"></i>
        </div>
        <span class="video-mini-duration">${item3.duration}</span>
      </div>
      <div class="popular-sub-content">
        <h5 class="popular-sub-title">${item3.title}</h5>
        <div class="popular-sub-date">
          <span><i class="fa-solid fa-eye"></i> ${item3.views}</span>
          <span>• ${item3.date}</span>
        </div>
      </div>
    </div>
  `;
}

// --- Video Player Modal Opener ---
window.openVideoModal = function(videoId) {
  const video = videoPostsData.find(v => v.id === videoId);
  if (!video) return;

  const modal = document.getElementById("video-player-modal");
  const body = document.getElementById("video-modal-body");
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="video-player-wrapper">
      <div class="video-player-screen">
        ${fluidImg(video.thumbnail, video.title, [640, 800], "(max-width: 760px) 100vw, 720px", 'class="video-poster-img" decoding="async"')}
        <div class="video-playing-overlay">
          <div class="video-playing-pulse" onclick="showToast('व्हिडिओ प्लेबॅक सक्रिय')">
            <i class="fa-solid fa-circle-play"></i>
          </div>
          <p style="color:#ffffff; font-weight:600; margin-top:12px; font-size:14px">
            <i class="fa-solid fa-video"></i> HD व्हिडिओ स्ट्रीम उपलब्ध (${video.duration})
          </p>
        </div>
      </div>
      <div class="video-details-pad">
        <div class="video-meta-row">
          <span class="category-tag-badge video-badge" style="position:static">${video.categoryLabel}</span>
          <span style="font-size:12px; color:var(--meta-color)">
            <i class="fa-solid fa-eye"></i> ${video.views} • <i class="fa-regular fa-clock"></i> ${video.date}
          </span>
        </div>
        <h3 style="font-size:18px; font-weight:700; color:var(--title-color); margin:10px 0 8px; line-height:1.4">
          ${video.title}
        </h3>
        <p style="font-size:13.5px; color:var(--text-color); line-height:1.6; margin-bottom:14px">
          ${video.description}
        </p>
        <div style="display:flex; gap:10px; flex-wrap:wrap">
          <button class="btn-read-full" onclick="showToast('व्हिडिओ प्लेलिस्टमध्ये सेव्ह केला')">
            <i class="fa-regular fa-bookmark"></i> नंतर पाहा
          </button>
          <button class="btn-listen-audio" onclick="navigator.clipboard?.writeText(window.location.href); showToast('व्हिडिओ लिंक कॉपी केली!')">
            <i class="fa-solid fa-share-nodes"></i> शेअर करा
          </button>
        </div>
      </div>
    </div>
  `;

  showModal(modal);
};

// --- Render Popular Items inside Slide-Out Drawer (Matching Image 2) ---
function renderDrawerPopularItems() {
  const container = document.getElementById("drawer-popular-list");
  if (!container) return;

  const item0 = articlesData[0]; // Featured Item 0
  const otherItems = [articlesData[1], articlesData[2], articlesData[4], articlesData[5]];

  container.innerHTML = `
    <!-- Item 0 Large Card with Overlay (Matching Image 2) -->
    <div class="popular-card-large" onclick="openArticleModal(${item0.id})" style="height:190px">
      ${fluidImg(item0.image, item0.title, [480, 800], "(max-width: 600px) 100vw, 300px")}
      <div class="popular-card-overlay">
        <span class="category-tag-badge">${item0.categoryLabel}</span>
        <h4 class="popular-card-title">${item0.title}</h4>
        <div class="popular-card-byline">by ${item0.author} - ${item0.date}</div>
      </div>
    </div>

    <!-- Items List (Matching Image 2) -->
    ${otherItems.map(item => `
      <div class="popular-sub-item" onclick="openArticleModal(${item.id})">
        <div class="popular-sub-thumb">
          ${thumbImg(item.image, item.title, 240)}
        </div>
        <div class="popular-sub-content">
          <h5 class="popular-sub-title">${item.title}</h5>
          <span class="popular-sub-date">${item.date}</span>
        </div>
      </div>
    `).join("")}
  `;
}

// Drawer Search functionality
function initDrawerSearch() {
  const input = document.getElementById("drawer-search-input");
  const btn = document.getElementById("drawer-search-action-btn");

  const executeDrawerSearch = () => {
    if (!input) return;
    const q = input.value.trim().toLowerCase();
    if (!q) return;

    const found = findArticleByQuery(q);

    if (found) {
      // Close drawer
      closeDrawer();
      openArticleModal(found.id);
    } else {
      showToast("बातमी सापडली नाही.");
    }
  };

  if (btn) btn.addEventListener("click", executeDrawerSearch);
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        executeDrawerSearch();
      }
    });
  }
}

// --- Header Search Handling ---
function initSearch() {
  const toggleBtn = document.getElementById("search-toggle-btn");
  const bar = document.getElementById("search-overlay-bar");
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");

  if (toggleBtn && bar) {
    toggleBtn.addEventListener("click", () => {
      const isShow = bar.classList.toggle("show");
      if (isShow && input) input.focus();
    });
  }

  if (form && input) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = input.value.trim().toLowerCase();
      if (!query) return;

      const found = findArticleByQuery(query);

      if (found) {
        if (bar) bar.classList.remove("show");
        openArticlePage(found.id);
      } else {
        showToast("बातमी सापडली नाही. कृपया दुसरा शब्द शोधा.");
      }
    });
  }
}

// =====================================================================================================
// ROUTER — one address (#hash) per view, so the browser's Back / Forward buttons, refresh and shared
// links all land exactly where you expect:
//
//   (no hash)      Home                 latest weekly issue + the News section
//   #weekly        Weekly publication   all issues, every one with its PDF e-paper
//   #issue-42      one weekly issue     (PDF reader, previous / next issue)
//   #cat-rajkiy  #cat-samajik  #cat-blogs  #cat-review      category sections
//   #post-12       one news / blog / review article
//
// Everything that navigates (menu, chips, labels, footer, cards, breadcrumbs, search ...) calls navigate().
// =====================================================================================================
let renderedRoute = null;      // canonical key of the view that is on screen
let currentView = "home";
let currentArticleId = null;

const routeForArticle = (a) => (a.category === "weekly" && a.issue ? "issue-" + a.issue : "post-" + a.id);
const routeForCategory = (cat) => (cat === "all" ? "" : cat === "weekly" ? "weekly" : "cat-" + cat);
const shareUrlFor = (a) => window.location.origin + window.location.pathname + "#" + routeForArticle(a);

function parseRoute(hash) {
  const h = String(hash || "").replace(/^#/, "");
  let m;
  if (!h || h === "home") return { type: "home" };
  if (h === "weekly") return { type: "weekly" };
  if ((m = h.match(/^issue-(\d+)$/))) return { type: "issue", no: parseInt(m[1], 10) };
  if ((m = h.match(/^cat-(rajkiy|samajik|blogs|review)$/))) return { type: "cat", cat: m[1] };
  if ((m = h.match(/^post-(\d+)$/))) return { type: "post", id: parseInt(m[1], 10) };
  return { type: "home", unknown: true };
}

const routeKeyOf = (r) =>
  r.type === "weekly" ? "weekly"
    : r.type === "issue" ? "issue-" + r.no
      : r.type === "cat" ? "cat-" + r.cat
        : r.type === "post" ? "post-" + r.id
          : "";

const currentRouteKey = () => routeKeyOf(parseRoute(window.location.hash));

function replaceUrl(key) {
  try { history.replaceState(history.state, "", key ? "#" + key : window.location.pathname + window.location.search); } catch (e) { /* ignore */ }
}

// remember how far the page was scrolled, so Back lands on the same spot of the list
function rememberScroll() {
  try { history.replaceState({ ...(history.state || {}), y: window.scrollY }, ""); } catch (e) { /* ignore */ }
}

function setDocTitle(text) {
  document.title = text ? `${text} | लोकमंगल न्यूज पोर्टल` : "लोकमंगल न्यूज पोर्टल | Lokmangal News Portal";
}

// Go to a view: closes menus / sheets first, adds ONE history entry, draws the view.
window.navigate = function(route) {
  const key = route || "";
  const dropdown = document.querySelector(".nav-item.has-dropdown");
  if (dropdown) dropdown.classList.remove("open-dropdown");
  closeModals();
  closeDrawer();
  closeSearchBar();

  // (if a menu / sheet was just closed with the Back step, wait until that step has finished)
  whenHistorySettled(() => {
    if (key === renderedRoute) {         // already here, e.g. tapping "Home" on Home: just start again from the top
      renderRoute({ scroll: true });
      return;
    }
    rememberScroll();
    history.pushState({ route: key }, "", key ? "#" + key : window.location.pathname + window.location.search);
    renderRoute({ scroll: true });
  });
};

// Draw the view that belongs to the current address
function renderRoute({ scroll = true, restoreY = null } = {}) {
  const r = parseRoute(window.location.hash);
  let article = null;
  if (r.type === "issue") article = issueByNo(r.no);
  if (r.type === "post") article = articlesData.find((a) => a.id === r.id);

  // unknown / stale addresses fall back to Home (and the address bar is cleaned up)
  if ((r.type === "issue" || r.type === "post") && !article) {
    replaceUrl("");
    return renderRoute({ scroll, restoreY });
  }
  if (r.unknown) replaceUrl("");
  // an old "#post-<weekly article id>" link becomes the proper "#issue-<number>" address
  if (r.type === "post" && article.category === "weekly" && article.issue) replaceUrl("issue-" + article.issue);

  if (article) {
    renderedRoute = routeForArticle(article);
    renderArticleView(article);
    updateNavActiveStates(article.category);
    setDocTitle(article.issue ? `अंक ${toDevanagari(article.issue)} • साप्ताहिक आवृत्ती` : article.title);
  } else {
    currentCategory = r.type === "weekly" ? "weekly" : r.type === "cat" ? r.cat : "all";
    const first = articlesData.find((a) => a.category === currentCategory);
    mainStoryId = currentCategory === "all" || currentCategory === "weekly" || !first ? latestIssue().id : first.id;
    renderedRoute = routeKeyOf(r.type === "home" ? { type: "home" } : r);
    renderHomeFeed();
    updateNavActiveStates(currentCategory);
    setDocTitle(currentCategory === "all" ? "" : getMarathiCategory(currentCategory));
  }

  if (restoreY !== null) window.scrollTo(0, restoreY);
  else if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
}

function initRouter() {
  try { history.scrollRestoration = "manual"; } catch (e) { /* ignore */ }
  // the first entry gets a state object too, so coming Back to it can restore the scroll position
  try { history.replaceState({ ...(history.state || {}), route: currentRouteKey() }, ""); } catch (e) { /* ignore */ }
  renderRoute({ scroll: false });
  window.addEventListener("hashchange", () => {     // address edited by hand / a plain #link was clicked
    if (parseRoute(window.location.hash).unknown) replaceUrl("");   // "#whatever" -> clean address
    if (currentRouteKey() !== renderedRoute) renderRoute({ scroll: true });
  });
}

window.returnToHomeFeed = function() {
  navigate("");
};

// ---------------------------------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------------------------------
window.renderHomeFeed = function() {
  currentView = "home";
  currentArticleId = null;
  const container = document.getElementById("main-content-container");
  if (!container) return;
  if (currentCategory === "all") renderHomeView(container);
  else if (currentCategory === "weekly") renderWeeklySection(container);
  else renderCategorySection(container, currentCategory);
};

window.renderMainStory = function(articleId) {
  mainStoryId = articleId;
  if (currentView === "home") renderHomeFeed();
};

const crumbHTML = (items) => items.map((it, i) => {
  const sep = i ? `<i class="fa-solid fa-chevron-right"></i>` : "";
  return sep + (it.onclick
    ? `<a href="javascript:void(0)" onclick="${it.onclick}">${it.label}</a>`
    : `<span class="crumb-current">${it.label}</span>`);
}).join("");

// ---- HOME: latest weekly issue first, then the News section ----
function renderHomeView(container) {
  const article = latestIssue();
  container.className = "main-content-box view-home";
  container.innerHTML = `
    <div class="breadcrumb-bar" id="main-breadcrumb">
      ${crumbHTML([
        { label: "Home", onclick: "returnToHomeFeed()" },
        { label: "साप्ताहिक आवृत्ती", onclick: "setCategoryFilter('weekly')" },
        { label: "नवीनतम अंक (Latest Issue)" },
      ])}
    </div>

    ${leadStoryHTML(article, { pdf: true, label: `नवीनतम अंक • अंक ${toDevanagari(article.issue)}` })}

    <!-- News section: Samajik + Rajkiy -->
    ${newsHeadHTML()}
    <div id="secondary-posts-feed">
      <!-- Populated below -->
    </div>
  `;
  renderSecondaryPosts();
}

// ---- WEEKLY PUBLICATION section: every issue with its PDF ----
function renderWeeklySection(container) {
  const issues = weeklyIssues();
  container.className = "main-content-box view-weekly";
  container.innerHTML = `
    <div class="breadcrumb-bar" id="main-breadcrumb">
      ${crumbHTML([
        { label: "Home", onclick: "returnToHomeFeed()" },
        { label: "साप्ताहिक आवृत्ती (Weekly Publication)" },
      ])}
    </div>

    <header class="weekly-section-head">
      <span class="weekly-section-kicker"><i class="fa-solid fa-newspaper"></i> लोकमंगल साप्ताहिक</span>
      <h1 class="weekly-section-title" id="main-headline-text">साप्ताहिक आवृत्ती</h1>
      <p class="weekly-section-sub">सर्व ${toDevanagari(issues.length)} अंक एकाच ठिकाणी — ऑनलाईन वाचा (PDF) किंवा मोफत डाउनलोड करा.</p>
    </header>

    ${weeklyLatestHTML(issues[0])}

    <div class="more-posts-header">
      <h2 class="more-posts-title"><i class="fa-solid fa-file-pdf" style="color:var(--accent-red); margin-right:6px"></i> सर्व अंक व PDF ई-पेपर <span class="more-title-sub">(All Issues)</span></h2>
    </div>
    <div id="secondary-posts-feed">
      <!-- Populated below -->
    </div>
  `;
  renderSecondaryPosts();
}

function weeklyLatestHTML(a) {
  const pdf = pdfUrlFor(a);
  return `
    <article class="weekly-latest">
      <div class="weekly-latest-cover" onclick="openArticlePage(${a.id})">
        ${fluidImg(a.image, a.title, [480, 800, 1200], "(max-width: 980px) 100vw, 320px", HERO_IMG_ATTRS)}
        <span class="latest-ribbon"><i class="fa-solid fa-bolt"></i> नवीनतम अंक</span>
        <span class="pdf-tag-overlay"><i class="fa-solid fa-file-pdf"></i> PDF</span>
      </div>
      <div class="weekly-latest-info">
        <span class="edition-no-badge">अंक ${toDevanagari(a.issue)}</span>
        <h2 class="weekly-latest-title" onclick="openArticlePage(${a.id})">${a.title}</h2>
        <div class="weekly-latest-meta">
          <span><i class="fa-regular fa-calendar"></i> ${a.date}</span>
          <span><i class="fa-regular fa-eye"></i> ${a.views} वाचक</span>
        </div>
        <p class="weekly-latest-excerpt">${a.excerpt}</p>
        <div class="weekly-latest-actions">
          <button class="btn-pdf-read" onclick="openWeeklyModal(${a.id})"><i class="fa-solid fa-book-open"></i> PDF ऑनलाईन वाचा</button>
          <button class="btn-card-read" onclick="openArticlePage(${a.id})"><i class="fa-solid fa-arrow-right"></i> अंकाचे पान</button>
          <a class="btn-pdf-dl" href="${pdf}" download="Lokmangal-Weekly-${a.issue}.pdf"><i class="fa-solid fa-download"></i> डाउनलोड</a>
        </div>
      </div>
    </article>`;
}

// ---- CATEGORY sections (Samajik, Rajkiy, Blogs, Reviews) ----
function renderCategorySection(container, cat) {
  const article = articlesData.find((a) => a.id === mainStoryId) || articlesData.find((a) => a.category === cat) || latestIssue();
  container.className = "main-content-box view-home";
  container.innerHTML = `
    <div class="breadcrumb-bar" id="main-breadcrumb">
      ${crumbHTML([
        { label: "Home", onclick: "returnToHomeFeed()" },
        { label: getMarathiCategory(cat) },
      ])}
    </div>

    ${leadStoryHTML(article)}

    <div class="more-posts-header">
      <h2 class="more-posts-title"><i class="fa-solid fa-newspaper" style="color:var(--main-color); margin-right:6px"></i> इतर ताज्या बातम्या</h2>
    </div>
    <div id="secondary-posts-feed">
      <!-- Populated below -->
    </div>
  `;
  renderSecondaryPosts();
}

// the big first story (Home, Weekly lead and category sections share it)
function leadStoryHTML(article, { pdf = false, label = "" } = {}) {
  const open = `openArticlePage(${article.id})`;
  const isIssue = article.category === "weekly" && article.issue;
  return `
    <h1 class="main-post-headline" id="main-headline-text" onclick="${open}" style="cursor:pointer">
      ${article.title}
    </h1>

    <div class="author-meta-bar">
      <div class="author-info-left">
        <div class="author-circle-avatar">${article.author.substring(0, 2)}</div>
        <div class="author-byline-text">
          by <a href="javascript:void(0)">${article.author}</a> - <span id="main-article-date">${article.date}</span>
        </div>
      </div>
      <div class="author-meta-right">
        <span><i class="fa-regular fa-comment"></i> ${getArticleComments(article.id).length} प्रतिक्रिया</span>
        <span><i class="fa-regular fa-eye"></i> ${article.views} वाचक</span>
      </div>
    </div>

    <div class="main-featured-media" id="main-featured-img-wrap" onclick="${open}">
      ${fluidImg(article.image, article.title, [480, 800, 1200], "(max-width: 980px) 100vw, 700px", `${HERO_IMG_ATTRS} id="main-story-image"`)}
      <span class="category-tag-badge hero-badge">${label || article.categoryLabel}</span>
      ${pdf && isIssue ? `<span class="latest-ribbon"><i class="fa-solid fa-bolt"></i> नवीनतम साप्ताहिक अंक</span>` : ""}
    </div>

    <div class="main-article-body" id="main-story-body">
      <p><strong>${article.categoryLabel} विशेष अहवाल:</strong> ${article.excerpt}</p>
      <p>${teaserHTML(article.content)}</p>
    </div>

    <div class="home-post-footer-bar">
      <div class="footer-readmore-wrap">
        <button class="btn-xapify-readmore" onclick="${open}">
          Read More <i class="fa-solid fa-arrow-right"></i>
        </button>
        ${pdf && isIssue ? `
        <button class="btn-xapify-pdf" onclick="openWeeklyModal(${article.id})">
          <i class="fa-solid fa-file-pdf"></i> PDF ई-पेपर
        </button>` : ""}
      </div>
      ${sharePillsHTML(article)}
    </div>
  `;
}

function sharePillsHTML(article) {
  const u = encodeURIComponent(shareUrlFor(article));
  const t = encodeURIComponent(article.title);
  return `
      <div class="footer-share-wrap" id="home-share-container">
        <div class="xapify-share-pills">
          <!-- Facebook -->
          <a href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener noreferrer" class="x-share-btn share-fb" title="Facebook वर शेअर करा">
            <i class="fa-brands fa-facebook-f"></i>
            <span class="x-share-divider">|</span>
            <span class="x-share-text">Facebook</span>
          </a>

          <!-- X (Twitter) -->
          <a href="https://twitter.com/intent/tweet?text=${t}&url=${u}" target="_blank" rel="noopener noreferrer" class="x-share-btn share-x" title="X (Twitter) वर शेअर करा">
            <i class="fa-brands fa-x-twitter"></i>
          </a>

          <!-- WhatsApp -->
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + shareUrlFor(article))}" target="_blank" rel="noopener noreferrer" class="x-share-btn share-wa" title="WhatsApp वर शेअर करा">
            <i class="fa-brands fa-whatsapp"></i>
          </a>

          <!-- Pinterest -->
          <a href="https://pinterest.com/pin/create/button/?url=${u}&media=${encodeURIComponent(article.image)}&description=${t}" target="_blank" rel="noopener noreferrer" class="x-share-btn share-pin" title="Pinterest वर शेअर करा">
            <i class="fa-brands fa-pinterest-p"></i>
          </a>

          <!-- Extra Expandable Icons (Reddit, LinkedIn, Tumblr, Telegram) -->
          <div class="x-share-more-group" id="x-share-more-group" style="display:none;">
            <a href="https://reddit.com/submit?url=${u}&title=${t}" target="_blank" rel="noopener noreferrer" class="x-share-btn share-reddit" title="Reddit वर शेअर करा">
              <i class="fa-brands fa-reddit-alien"></i>
            </a>
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${u}" target="_blank" rel="noopener noreferrer" class="x-share-btn share-linkedin" title="LinkedIn वर शेअर करा">
              <i class="fa-brands fa-linkedin-in"></i>
            </a>
            <a href="https://www.tumblr.com/widgets/share/tool?canonicalUrl=${u}&title=${t}" target="_blank" rel="noopener noreferrer" class="x-share-btn share-tumblr" title="Tumblr वर शेअर करा">
              <i class="fa-brands fa-tumblr"></i>
            </a>
            <a href="https://t.me/share/url?url=${u}&text=${t}" target="_blank" rel="noopener noreferrer" class="x-share-btn share-telegram" title="Telegram वर शेअर करा">
              <i class="fa-brands fa-telegram"></i>
            </a>
          </div>

          <!-- Email -->
          <a href="mailto:?subject=${t}&body=${u}" class="x-share-btn share-email" title="Email द्वारे शेअर करा">
            <i class="fa-solid fa-envelope"></i>
          </a>

          <!-- Plus / Minus Toggle Button -->
          <button type="button" class="x-share-btn share-toggle-more" id="share-toggle-more-btn" onclick="toggleExtraShareIcons()" title="अधिक पर्याय" aria-label="More share buttons">
            <i class="fa-solid fa-plus" id="share-toggle-icon"></i>
          </button>
        </div>
      </div>`;
}

window.toggleExtraShareIcons = function() {
  const group = document.getElementById("x-share-more-group");
  const icon = document.getElementById("share-toggle-icon");
  const btn = document.getElementById("share-toggle-more-btn");
  if (!group || !icon) return;

  const isHidden = (group.style.display === "none");
  if (isHidden) {
    group.style.display = "inline-flex";
    icon.className = "fa-solid fa-minus";
    if (btn) btn.title = "कमी पर्याय";
  } else {
    group.style.display = "none";
    icon.className = "fa-solid fa-plus";
    if (btn) btn.title = "अधिक पर्याय";
  }
};

// ---------------------------------------------------------------------------------------------------
// Lists under the first story
// ---------------------------------------------------------------------------------------------------
let homeNewsFilter = "all";     // all | samajik | rajkiy

function newsHeadHTML() {
  const pill = (key, label) => `<button type="button" class="news-pill${homeNewsFilter === key ? " active" : ""}" data-news="${key}" aria-pressed="${homeNewsFilter === key}" onclick="setHomeNewsFilter('${key}')">${label}</button>`;
  return `
    <div class="more-posts-header news-section-head">
      <h2 class="more-posts-title"><i class="fa-solid fa-newspaper" style="color:var(--main-color); margin-right:6px"></i> ताज्या बातम्या <span class="more-title-sub">(News)</span></h2>
      <div class="news-pills" role="group" aria-label="बातम्यांचा विभाग">
        ${pill("all", "सर्व")}${pill("samajik", "सामाजिक")}${pill("rajkiy", "राजकीय")}
      </div>
    </div>`;
}

window.setHomeNewsFilter = function(filter) {
  homeNewsFilter = filter;
  document.querySelectorAll(".news-pill").forEach((b) => {
    const on = b.dataset.news === filter;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", String(on));
  });
  const feed = document.getElementById("secondary-posts-feed");
  if (feed && currentCategory === "all") feed.innerHTML = newsListHTML(filter);
};

// one row of a list (thumbnail + title + category chip + date + views)
function postRowHTML(item) {
  return `
    <div class="secondary-post-item" onclick="openArticlePage(${item.id})">
      <div class="secondary-post-thumb">
        ${thumbImg(item.image, item.title, 320)}
      </div>
      <div class="secondary-post-details">
        <h4 class="secondary-post-title">${item.title}</h4>
        <div class="secondary-post-meta">
          <span class="cat-chip cat-${item.category}">${item.categoryLabel}</span>
          <span class="meta-dot">•</span>
          <span>${item.date}</span>
          <span class="meta-dot">•</span>
          <span><i class="fa-regular fa-eye"></i> ${item.views}</span>
        </div>
      </div>
    </div>`;
}

// News section on Home: first story as a big card, the rest as rows
function newsListHTML(filter) {
  const list = articlesData.filter((a) => NEWS_CATEGORIES.includes(a.category) && (filter === "all" || a.category === filter));
  if (!list.length) return `<p class="empty-note">या विभागात बातम्या लवकरच जोडल्या जातील.</p>`;
  const [first, ...rest] = list;
  return `
    <div class="popular-card-large news-featured" onclick="openArticlePage(${first.id})">
      ${fluidImg(first.image, first.title, [480, 800, 1200], "(max-width: 980px) 100vw, 640px")}
      <div class="popular-card-overlay">
        <span class="category-tag-badge cat-${first.category}">${first.categoryLabel}</span>
        <h3 class="popular-card-title">${first.title}</h3>
        <div class="popular-card-byline">${first.date} • <i class="fa-regular fa-eye"></i> ${first.views}</div>
      </div>
    </div>
    ${rest.map(postRowHTML).join("")}`;
}

function weeklyRowHTML(item) {
  return `
    <div class="secondary-post-item weekly-edition-item" onclick="openArticlePage(${item.id})">
      <div class="secondary-post-thumb">
        ${thumbImg(item.image, item.title, 320)}
        <span class="pdf-tag-overlay"><i class="fa-solid fa-file-pdf"></i> PDF</span>
      </div>
      <div class="secondary-post-details">
        <span class="edition-no-badge">अंक ${toDevanagari(item.issue)}</span>
        <h4 class="secondary-post-title">${item.title}</h4>
        <div class="secondary-post-meta">
          <span style="color:var(--accent-red); font-weight:700"><i class="fa-regular fa-newspaper"></i> ई-पेपर</span>
          <span class="meta-dot">•</span>
          <span>${item.date}</span>
          <span class="meta-dot">•</span>
          <span><i class="fa-regular fa-eye"></i> ${item.views}</span>
        </div>
        <div class="weekly-card-actions" onclick="event.stopPropagation()">
          <button class="btn-card-read" onclick="openArticlePage(${item.id})">
            <i class="fa-solid fa-book-open"></i> वाचा
          </button>
          <button class="btn-card-pdf" onclick="openWeeklyModal(${item.id})">
            <i class="fa-solid fa-file-pdf"></i> PDF ई-पेपर
          </button>
        </div>
      </div>
    </div>`;
}

function weeklyArchiveHTML() {
  const list = weeklyIssues();
  return `
    <div class="weekly-search-filter-bar">
      <div class="weekly-search-input-wrap">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="weekly-filter-input" enterkeyhint="search" autocomplete="off" placeholder="अंक क्रमांक किंवा विषय शोधा (उदा. अंक २५, शेतकरी, अर्थसंकल्प)..." oninput="filterWeeklyIssuesList(this.value)" />
      </div>
      <div class="weekly-count-tag"><span id="weekly-visible-count">${toDevanagari(list.length)}</span> अंक उपलब्ध</div>
    </div>
    <div class="weekly-editions-container" id="weekly-editions-list">
      ${list.map(weeklyRowHTML).join("")}
    </div>
    <p class="empty-note" id="weekly-empty-note" hidden>असा अंक सापडला नाही. दुसरा शब्द किंवा अंक क्रमांक शोधा.</p>`;
}

function renderSecondaryPosts() {
  const container = document.getElementById("secondary-posts-feed");
  if (!container) return;

  if (currentCategory === "all") {            // Home: the News section
    container.innerHTML = newsListHTML(homeNewsFilter);
    return;
  }
  if (currentCategory === "weekly") {         // Weekly publication: every issue
    container.innerHTML = weeklyArchiveHTML();
    return;
  }

  // other categories (Rajkiy, Samajik, Blogs, Review): the rest of the section
  const list = articlesData.filter((a) => a.category === currentCategory && a.id !== mainStoryId);
  container.innerHTML = list.length
    ? list.map(postRowHTML).join("")
    : `<p class="empty-note">या विभागात इतर बातम्या लवकरच जोडल्या जातील.</p>`;
}

// Live filter for the weekly archive: "२५", "25", "अंक २५", "शेतकरी" ... all work
window.filterWeeklyIssuesList = function(query) {
  const q = devToAscii((query || "").trim().toLowerCase());
  const items = document.querySelectorAll("#weekly-editions-list .weekly-edition-item");
  let count = 0;
  items.forEach((el) => {
    const matches = !q || devToAscii(el.innerText.toLowerCase()).includes(q);
    el.style.display = matches ? "" : "none";
    if (matches) count++;
  });
  const countSpan = document.getElementById("weekly-visible-count");
  if (countSpan) countSpan.innerText = toDevanagari(count);
  const empty = document.getElementById("weekly-empty-note");
  if (empty) empty.hidden = count !== 0;
};

// --- Per-Article Comments Management (Local Storage & Interactive) ---
const AVATAR_PALETTE = [
  "#2563eb", "#059669", "#d97706", "#7c3aed", 
  "#db2777", "#0891b2", "#4f46e5", "#e11d48", "#0d9488"
];

function getInitials(name) {
  if (!name) return "वा";
  const clean = name.trim().replace(/^श्री\s*|^सौ\s*|^डॉ\.\s*/i, "");
  const parts = clean.split(/\s+/);
  if (parts.length > 1) {
    return (parts[0][0] || "") + (parts[1][0] || "");
  }
  return clean.substring(0, 2);
}

const DEFAULT_COMMENTS_SEED = {
  1: [
    { id: 101, name: "रविंद्र गायकवाड", text: "अतिशय अभ्यासपूर्ण आणि सविस्तर बातमी दिली आहे. लोकमंगल पोर्टलचे मनापासून आभार!", time: "२ तास आधी", color: "#2563eb", likes: 5 },
    { id: 102, name: "सुप्रिया पाटील", text: "शेतकऱ्यांसाठी आणि सर्वसामान्यांसाठी हा निर्णय अत्यंत महत्त्वाचा ठरेल.", time: "४५ मिनिटे आधी", color: "#059669", likes: 2 }
  ],
  2: [
    { id: 201, name: "सचिन शिंदे", text: "खूप अचूक माहिती! अशाच वस्तुनिष्ठ बातम्या वाचायला आवडतात.", time: "३ तास आधी", color: "#7c3aed", likes: 4 },
    { id: 202, name: "अमित जोशी", text: "लोकमंगल न्यूज नेहमीच निष्पक्ष आणि सत्य बातमी समोर आणते, अभिनंदन!", time: "१ तास आधी", color: "#d97706", likes: 3 }
  ],
  3: [
    { id: 301, name: "डॉ. प्रज्ञा कुलकर्णी", text: "आरोग्य आणि जीवनशैली संदर्भातील माहिती अतिशय उपयुक्त आहे. धन्यवाद!", time: "४ तास आधी", color: "#db2777", likes: 6 }
  ],
  4: [
    { id: 401, name: "प्रा. विजय कांबळे", text: "वाचन संस्कृती टिकवून ठेवण्यासाठी असा वैचारिक लेख खूप दिशादर्शक आहे.", time: "५ तास आधी", color: "#0891b2", likes: 3 }
  ],
  5: [
    { id: 501, name: "दत्तात्रय पवार", text: "मंत्रिमंडळाच्या या निर्णयामुळे शेतकऱ्यांना खरोखर मोठा दिलासा मिळेल.", time: "२ तास आधी", color: "#2563eb", likes: 4 }
  ],
  6: [
    { id: 601, name: "आनंद मोहिते", text: "श्रमदानातून पाणीटंचाईवर मात करणे हा सर्व गावांनी घ्यावा असा आदर्श आहे!", time: "३ तास आधी", color: "#059669", likes: 5 }
  ],
  7: [
    { id: 701, name: "अ‍ॅड. निलेश सावंत", text: "स्थानिक स्वराज्य संस्थांविषयी सामान्य नागरिकांमध्ये जागृती निर्माण करणारा लेख.", time: "६ तास आधी", color: "#4f46e5", likes: 2 }
  ],
  8: [
    { id: 801, name: "सुनील भोसले", text: "उत्कृष्ट बातमी आणि वेळेवर दिलेली माहिती. लोकमंगल टीमचे अभिनंदन!", time: "१ तास आधी", color: "#e11d48", likes: 1 }
  ],
  13: [
    { id: 1301, name: "विकास जाधव (शेतकरी)", text: "शेतकरी समृद्धी विशेषांकातील तंत्रज्ञान माहिती अतिशय उपयुक्त आहे. धन्यवाद!", time: "२ तास आधी", color: "#059669", likes: 4 },
    { id: 1302, name: "संजय देशमुख", text: "ठिबक सिंचन आणि दुष्काळमुक्तीवरील लेख सर्व शेतकऱ्यांनी वाचण्यासारखा आहे.", time: "१ तास आधी", color: "#2563eb", likes: 3 }
  ],
  14: [
    { id: 1401, name: "अनिता जगदाळे", text: "महिला बचत गटांच्या यशाची गाथा वाचून खूप अभिमान वाटला. प्रेरणादायी अंक!", time: "३ तास आधी", color: "#db2777", likes: 5 }
  ],
  15: [
    { id: 1501, name: "प्रा. रमेश शिंदे", text: "ग्रामीण शिक्षण आणि आरोग्यावरील अभ्यासपूर्ण मांडणी. लोकमंगलचे अभिनंदन!", time: "४ तास आधी", color: "#0891b2", likes: 2 }
  ],
  16: [
    { id: 1601, name: "किरण थोरात", text: "सहकार चळवळ आणि कृषी बाजारपेठेचे विश्लेषण अत्यंत परखड आहे.", time: "५ तास आधी", color: "#7c3aed", likes: 3 }
  ]
};

window.getArticleComments = function(articleId) {
  const key = "lokmangal_comments_" + articleId;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Failed to parse comments", e);
    }
  }
  // Fallback / default seed
  const defaults = DEFAULT_COMMENTS_SEED[articleId] || [
    {
      id: Date.now() - 3600000,
      name: "लोकमंगल वाचक",
      text: "छान बातमी! लोकमंगल न्यूज पोर्टलच्या नियमित वार्तांकनामुळे ताज्या घडामोडी समजतात.",
      time: "२ तास आधी",
      color: AVATAR_PALETTE[articleId % AVATAR_PALETTE.length],
      likes: 2
    }
  ];
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
};

window.saveArticleComments = function(articleId, comments) {
  localStorage.setItem("lokmangal_comments_" + articleId, JSON.stringify(comments));
};

window.renderCommentsListHTML = function(comments) {
  if (!comments || comments.length === 0) {
    return `
      <div style="text-align:center; padding:28px 16px; color:var(--meta-color); background:var(--body-bg-color); border:1px dashed var(--border-color); border-radius:var(--border-radius);">
        <i class="fa-regular fa-comment-dots" style="font-size:26px; display:block; margin-bottom:8px; opacity:0.6;"></i>
        <span style="font-size:13.5px; font-weight:500;">अद्याप कोणतीही प्रतिक्रिया आलेली नाही. पहिली प्रतिक्रिया तुम्ही नोंदवा!</span>
      </div>
    `;
  }

  return comments.map(c => `
    <div class="comment-item-card" id="comment-card-${c.id}">
      <div class="author-circle-avatar comment-avatar" style="background:${c.color || '#2563eb'}">
        ${getInitials(c.name)}
      </div>
      <div class="comment-body-wrap">
        <div class="comment-header-row">
          <span class="comment-user-name">${c.name}</span>
          <span class="comment-time-badge"><i class="fa-regular fa-clock"></i> ${c.time || 'आत्ताच'}</span>
        </div>
        <p class="comment-text-content">${c.text}</p>
        <div class="comment-actions-bar">
          <button class="comment-action-btn" onclick="toggleCommentLike(this, ${c.id})">
            <i class="fa-regular fa-thumbs-up"></i> पसंत (${c.likes || 0})
          </button>
          <button class="comment-action-btn" onclick="replyToComment('${(c.name || '').replace(/'/g, "\\'")}')">
            <i class="fa-solid fa-reply"></i> उत्तर द्या
          </button>
        </div>
      </div>
    </div>
  `).join("");
};

window.toggleCommentLike = function(btn, commentId) {
  const isLiked = btn.classList.contains("active");
  const countMatch = btn.innerText.match(/\d+/);
  let count = countMatch ? parseInt(countMatch[0], 10) : 0;
  if (isLiked) {
    btn.classList.remove("active");
    btn.innerHTML = `<i class="fa-regular fa-thumbs-up"></i> पसंत (${Math.max(0, count - 1)})`;
  } else {
    btn.classList.add("active");
    btn.innerHTML = `<i class="fa-solid fa-thumbs-up" style="color:var(--main-color)"></i> पसंत (${count + 1})`;
  }
};

window.replyToComment = function(authorName) {
  const textarea = document.getElementById("comment-user-text");
  if (textarea) {
    textarea.value = `@${authorName} `;
    textarea.focus();
    textarea.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

window.submitUserComment = function(articleId) {
  const nameInput = document.getElementById("comment-user-name");
  const textInput = document.getElementById("comment-user-text");
  
  if (!textInput || !textInput.value.trim()) {
    showToast("कृपया तुमची प्रतिक्रिया लिहा.");
    if (textInput) textInput.focus();
    return;
  }
  
  const rawName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "लोकमंगल वाचक";
  const commentText = textInput.value.trim();
  
  const comments = getArticleComments(articleId);
  const newComment = {
    id: Date.now(),
    name: rawName,
    text: commentText,
    time: "आत्ताच",
    color: AVATAR_PALETTE[Math.floor(Math.random() * AVATAR_PALETTE.length)],
    likes: 0
  };
  
  comments.push(newComment);
  saveArticleComments(articleId, comments);
  
  // Update comments list DOM
  const container = document.getElementById("comments-list-container");
  if (container) {
    container.innerHTML = renderCommentsListHTML(comments);
  }
  
  // Update counts
  const bylineCount = document.getElementById("post-comment-count");
  if (bylineCount) {
    bylineCount.innerHTML = `<i class="fa-regular fa-comment"></i> ${comments.length} प्रतिक्रिया`;
  }
  const headingCount = document.getElementById("comments-heading-count");
  if (headingCount) {
    headingCount.innerText = `(${comments.length})`;
  }
  
  // Clear textarea and drop the on-screen keyboard so the new comment + toast are visible
  textInput.value = "";
  textInput.blur();
  if (nameInput) nameInput.blur();

  showToast("तुमची प्रतिक्रिया यशस्वीरीत्या प्रसिद्ध झाली!");
};

// --- One article / one weekly issue on its own page (center column) ---
function renderArticleView(article) {
  currentView = "article";
  currentArticleId = article.id;

  const container = document.getElementById("main-content-container");
  if (!container) return;

  const isIssue = article.category === "weekly" && !!article.issue;
  const comments = getArticleComments(article.id);
  const pageUrl = shareUrlFor(article);
  const sectionOnclick = `setCategoryFilter('${article.category}')`;

  // previous / next: by issue number for weekly issues, inside the same section for everything else
  let prevItem, nextItem, prevText, nextText;
  if (isIssue) {
    prevItem = issueByNo(article.issue - 1);
    nextItem = issueByNo(article.issue + 1);
    prevText = "मागील अंक";
    nextText = "पुढील अंक";
  } else {
    const sameSection = articlesData.filter((a) => a.category === article.category);
    const idx = sameSection.findIndex((a) => a.id === article.id);
    prevItem = idx > 0 ? sameSection[idx - 1] : null;
    nextItem = idx < sameSection.length - 1 ? sameSection[idx + 1] : null;
    prevText = "मागील बातमी";
    nextText = "पुढील बातमी";
  }

  // related: other issues for an issue; the same section first (then other news) for an article
  const related = isIssue
    ? weeklyIssues().filter((a) => a.id !== article.id).slice(0, 6)
    : [
        ...articlesData.filter((a) => a.id !== article.id && a.category === article.category),
        ...articlesData.filter((a) => a.id !== article.id && a.category !== article.category && NEWS_CATEGORIES.includes(a.category)),
        ...articlesData.filter((a) => a.id !== article.id && a.category !== "weekly" && !NEWS_CATEGORIES.includes(a.category) && a.category !== article.category),
      ].slice(0, 3);

  const latest = latestIssue();
  const pdf = isIssue ? pdfUrlFor(article) : "";

  container.className = "main-content-box view-article" + (isIssue ? " view-issue" : "");
  container.innerHTML = `
    <!-- Breadcrumb: Home > section > this page. Every part is a link that does what it says. -->
    <div class="breadcrumb-bar" id="main-breadcrumb">
      <a href="javascript:void(0)" onclick="returnToHomeFeed()">Home</a>
      <i class="fa-solid fa-chevron-right"></i>
      <a href="javascript:void(0)" onclick="${sectionOnclick}">${isIssue ? "साप्ताहिक आवृत्ती" : article.categoryLabel}</a>
      <i class="fa-solid fa-chevron-right crumb-sep-title"></i>
      <span class="crumb-title">${isIssue ? "अंक " + toDevanagari(article.issue) : article.title}</span>
    </div>

    <h1 class="single-post-headline">
      ${article.title}
    </h1>

    <div class="author-meta-bar">
      <div class="author-info-left">
        <div class="author-circle-avatar">${article.author.substring(0, 2)}</div>
        <div class="author-byline-text">
          by <a href="javascript:void(0)">${article.author}</a> - <span>${article.date}</span>
        </div>
      </div>
      <div class="author-meta-right">
        <span id="post-comment-count"><i class="fa-regular fa-comment"></i> ${comments.length} प्रतिक्रिया</span>
        <span><i class="fa-regular fa-eye"></i> ${article.views} वाचक</span>
      </div>
    </div>

    ${isIssue ? `
    <!-- The weekly issue: cover + PDF e-paper -->
    <div class="issue-pdf-card">
      <div class="issue-pdf-cover" onclick="openWeeklyModal(${article.id})" role="button" tabindex="0" aria-label="PDF ई-पेपर वाचा"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openWeeklyModal(${article.id});}">
        ${fluidImg(article.image, article.title, [480, 800, 1200], "(max-width: 980px) 100vw, 700px", HERO_IMG_ATTRS)}
        <span class="pdf-tag-overlay"><i class="fa-solid fa-file-pdf"></i> PDF</span>
        <span class="issue-read-badge"><i class="fa-solid fa-book-open"></i> ऑनलाईन वाचा</span>
      </div>
      <div class="issue-pdf-info">
        <span class="edition-no-badge">अंक ${toDevanagari(article.issue)}</span>
        <h2 class="issue-pdf-title">ई-पेपर (PDF) — मोफत वाचा व डाउनलोड करा</h2>
        <p class="issue-pdf-meta">वर्ष १० • ${article.date} • लोकमंगल साप्ताहिक</p>
        <div class="issue-pdf-actions">
          <button class="btn-pdf-read" onclick="openWeeklyModal(${article.id})"><i class="fa-solid fa-book-open"></i> PDF ऑनलाईन वाचा</button>
          <a class="btn-pdf-dl" href="${pdf}" download="Lokmangal-Weekly-${article.issue}.pdf"><i class="fa-solid fa-download"></i> PDF डाउनलोड</a>
          <a class="btn-pdf-open" href="${pdf}" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> नवीन टॅब</a>
        </div>
      </div>
    </div>
    ` : `
    <!-- Notice for the newest weekly issue -->
    <div class="responsive-ad-banner" onclick="openWeeklyModal()">
      <i class="fa-solid fa-bullhorn" style="margin-right:6px"></i>
      लोकमंगल साप्ताहिक आवृत्ती (अंक ${toDevanagari(latest.issue)}) - डिजिटल ई-पेपर (PDF) उपलब्ध! येथे क्लिक करा
    </div>

    <div class="single-post-media">
      ${fluidImg(article.image, article.title, [480, 800, 1200], "(max-width: 980px) 100vw, 700px", HERO_IMG_ATTRS)}
    </div>
    `}

    <div class="single-article-content">
      <p style="font-weight:600; font-size:16px; line-height:1.75; color:var(--title-color)">
        ${article.excerpt}
      </p>
      ${article.content}
      <blockquote>
        "सत्य आणि निःपक्षपाती पत्रकारिता हाच लोकशाहीचा खरा आधारस्तंभ आहे. लोकमंगल न्यूज पोर्टल वाचकांच्या प्रत्येक विश्वासास पात्र ठरण्यासाठी कटिबद्ध आहे."
      </blockquote>
      <p>
        या संदर्भातील पुढील ताज्या घडामोडी आणि विशेष विश्लेषणासाठी लोकमंगल न्यूज पोर्टलशी जोडलेले राहा. आपल्या परिसरातील बातम्या आमच्या प्रतिनिधींना कळवा.
      </p>
    </div>

    <!-- Social Share Bar -->
    <div class="single-share-bar">
      <span class="share-label"><i class="fa-solid fa-share-nodes"></i> शेअर करा:</span>
      <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' - लोकमंगल न्यूज ' + pageUrl)}" target="_blank" rel="noopener" class="social-icon-box wa share-btn">
        <i class="fa-brands fa-whatsapp"></i> WhatsApp
      </a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}" target="_blank" rel="noopener" class="social-icon-box fb share-btn">
        <i class="fa-brands fa-facebook-f"></i> Facebook
      </a>
      <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(pageUrl)}" target="_blank" rel="noopener" class="social-icon-box tw share-btn">
        <i class="fa-brands fa-x-twitter"></i> Twitter
      </a>
      <button class="social-icon-box cp share-btn" onclick="navigator.clipboard?.writeText('${pageUrl}'); showToast('${isIssue ? "अंकाची" : "बातमी"} लिंक कॉपी केली!')">
        <i class="fa-solid fa-link"></i> कॉपी लिंक
      </button>
    </div>

    <!-- Author Bio Box -->
    <div class="author-bio-box">
      <div class="author-circle-avatar" style="width:48px; height:48px; font-size:16px">${article.author.substring(0, 2)}</div>
      <div>
        <strong style="display:block; font-size:15px; color:var(--title-color)">${article.author}</strong>
        <p style="font-size:12.5px; color:var(--meta-color); margin:4px 0 0">
          लोकमंगल न्यूज पोर्टलचे अधिकृत पत्रकार व विश्लेषक. सत्य, पारदर्शक आणि वस्तुनिष्ठ पत्रकारितेसाठी कटिबद्ध.
        </p>
      </div>
    </div>

    <!-- Previous / Next (issue number for issues, same section for articles) -->
    <div class="post-navigation-row">
      ${prevItem ? `
        <div class="post-nav-item prev" onclick="openArticlePage(${prevItem.id})">
          <span class="nav-dir"><i class="fa-solid fa-arrow-left"></i> ${prevText}${prevItem.issue ? " (अंक " + toDevanagari(prevItem.issue) + ")" : ""}</span>
          <span class="nav-title">${prevItem.title}</span>
        </div>
      ` : `<div></div>`}
      ${nextItem ? `
        <div class="post-nav-item next" onclick="openArticlePage(${nextItem.id})">
          <span class="nav-dir">${nextText}${nextItem.issue ? " (अंक " + toDevanagari(nextItem.issue) + ")" : ""} <i class="fa-solid fa-arrow-right"></i></span>
          <span class="nav-title">${nextItem.title}</span>
        </div>
      ` : `<div></div>`}
    </div>

    <!-- Related -->
    <div class="more-posts-header">
      <h2 class="more-posts-title"><i class="fa-solid fa-newspaper" style="color:var(--main-color); margin-right:6px"></i> ${isIssue ? "इतर अंक" : "इतर संबंधित बातम्या"}</h2>
    </div>
    <div class="related-posts-grid">
      ${related.map((rel) => `
        <div class="related-post-card" onclick="openArticlePage(${rel.id})">
          <div class="related-post-thumb">
            ${thumbImg(rel.image, rel.title, 520)}
          </div>
          <h4 class="related-post-title">${rel.title}</h4>
        </div>
      `).join("")}
    </div>
    ${isIssue ? `
    <div class="issue-all-link">
      <button class="btn-archive-pill" onclick="setCategoryFilter('weekly')"><i class="fa-solid fa-layer-group" style="color:var(--accent-red)"></i> सर्व ${toDevanagari(weeklyIssues().length)} अंक व PDF पहा</button>
    </div>` : ""}

    <!-- Comments Section (वाचकांच्या सर्व प्रतिक्रिया) -->
    <div class="comments-section-wrap" id="comments-section">
      <h3 class="comments-heading">
        <i class="fa-regular fa-comments"></i> वाचकांच्या प्रतिक्रिया (Comments) <span id="comments-heading-count" style="font-size:14px; color:var(--meta-color); font-weight:600">(${comments.length})</span>
      </h3>

      <!-- All comments list for this post -->
      <div id="comments-list-container" class="comments-list-box">
        ${renderCommentsListHTML(comments)}
      </div>

      <!-- Add Comment Form Box -->
      <div class="add-comment-wrapper">
        <div class="add-comment-title">
          <i class="fa-solid fa-pen-to-square" style="color:var(--main-color)"></i> तुमची प्रतिक्रिया नोंदवा
        </div>
        <div class="comment-inputs-row">
          <input type="text" id="comment-user-name" class="comment-name-input" placeholder="तुमचे नाव (उदा. सचिन पवार)" />
        </div>
        <textarea id="comment-user-text" class="comment-textarea-input" placeholder="या बातमीवर आपले मत किंवा प्रतिक्रिया येथे लिहा..."></textarea>
        <div class="comment-submit-row">
          <button class="btn-submit-comment" onclick="submitUserComment(${article.id})">
            <i class="fa-solid fa-paper-plane"></i> प्रतिक्रिया पाठवा
          </button>
        </div>
      </div>
    </div>

    <!-- Back links: to the section this page belongs to, and to Home -->
    <div class="back-home-wrap">
      <button class="btn-read-full" onclick="${sectionOnclick}">
        <i class="fa-solid fa-arrow-left"></i> ${isIssue ? "सर्व साप्ताहिक अंकांकडे परत" : article.categoryLabel + " विभागाकडे परत"}
      </button>
      <button class="btn-listen-audio" onclick="returnToHomeFeed()">
        <i class="fa-solid fa-house"></i> होम
      </button>
    </div>
  `;
}

// Any link / card that opens an article or a weekly issue goes through the router
window.openArticlePage = function(id) {
  const article = articlesData.find((a) => a.id === Number(id));
  if (article) navigate(routeForArticle(article));
};

window.openIssuePage = function(no) {
  navigate("issue-" + no);
};

// Alias openArticleModal directly to openArticlePage
window.openArticleModal = function(id) {
  openArticlePage(id);
};

// --- Modals (centered dialogs on desktop, bottom sheets on phones) ---
let focusBeforeModal = null;

function showModal(modal) {
  if (!modal) return;
  focusBeforeModal = document.activeElement;
  modal.classList.add("active");
  syncScrollLock();
  pushOverlayHistory();
  const closeBtn = modal.querySelector(".modal-close-icon");
  if (closeBtn) closeBtn.focus({ preventScroll: true });
}

let currentModalArticle = null;

// ---------------------------------------------------------------------------------------------------
// PDF e-paper reader. pdf.js (the library that draws the PDF pages on every phone / browser) is only
// downloaded when somebody actually opens a PDF - the normal pages never pay for it.
// ---------------------------------------------------------------------------------------------------
const PDFJS_BASE = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
const PDFJS_SRI = "sha512-q+4liFwdPC/bNdhUpZx6aXDx/h77yEQtn4I1slHydcbZK34nLaR3cAeYSJshoxIOq3mjEf7xJE8YWIUHMn+oCQ==";
let pdfjsPromise = null;
let readerRun = 0;                 // bumps on every open / close, so stale async work stops by itself
let readerDoc = null;
let readerPageObserver = null;
let readerScrollHandler = null;

function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = PDFJS_BASE + "pdf.min.js";
    s.integrity = PDFJS_SRI;
    s.crossOrigin = "anonymous";
    s.referrerPolicy = "no-referrer";
    s.onload = () => {
      if (!window.pdfjsLib) { pdfjsPromise = null; reject(new Error("pdfjs")); return; }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_BASE + "pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    s.onerror = () => { pdfjsPromise = null; reject(new Error("pdfjs-load")); };
    document.head.appendChild(s);
  });
  return pdfjsPromise;
}

function readerParts() {
  return {
    body: document.getElementById("reader-body"),
    pages: document.getElementById("reader-pages"),
    status: document.getElementById("reader-status"),
    ind: document.getElementById("reader-page-ind"),
  };
}

function readerMessage(html) {
  const { status } = readerParts();
  if (!status) return;
  status.hidden = false;
  status.innerHTML = html;
}

// forget everything about the PDF that was open (frees the page canvases too)
function resetReader() {
  readerRun++;
  if (readerPageObserver) { readerPageObserver.disconnect(); readerPageObserver = null; }
  const { body, pages, status, ind } = readerParts();
  if (body && readerScrollHandler) { body.removeEventListener("scroll", readerScrollHandler); readerScrollHandler = null; }
  if (readerDoc) { try { readerDoc.destroy(); } catch (e) { /* ignore */ } readerDoc = null; }
  if (pages) pages.innerHTML = "";
  if (status) { status.hidden = true; status.innerHTML = ""; }
  if (ind) ind.textContent = "";
}

async function loadReader(url) {
  resetReader();
  const run = readerRun;
  const { body, pages, ind } = readerParts();
  if (!body || !pages) return;
  body.scrollTop = 0;
  readerMessage(`<i class="fa-solid fa-spinner fa-spin" style="font-size:26px"></i><span>PDF लोड होत आहे…</span>`);

  try {
    // 1) is the file there?   2) load pdf.js   3) open the document
    let head;
    try { head = await fetch(url, { method: "HEAD", cache: "no-cache" }); } catch (e) { throw new Error("network"); }
    if (run !== readerRun) return;
    if (!head.ok) throw new Error("missing");

    const lib = await loadPdfJs();
    if (run !== readerRun) return;
    const doc = await lib.getDocument({ url }).promise;
    if (run !== readerRun) { doc.destroy(); return; }
    readerDoc = doc;

    const first = await doc.getPage(1);
    if (run !== readerRun) return;
    const vp = first.getViewport({ scale: 1 });
    const total = doc.numPages;
    const { status } = readerParts();
    if (status) status.hidden = true;

    // empty page boxes first (so the scroll bar is right), pictures are drawn when they come near the screen
    for (let n = 1; n <= total; n++) {
      const wrap = document.createElement("div");
      wrap.className = "reader-page";
      wrap.dataset.page = String(n);
      wrap.style.aspectRatio = `${vp.width} / ${vp.height}`;
      pages.appendChild(wrap);
    }
    if (ind) ind.textContent = `पान १ / ${toDevanagari(total)}`;

    readerPageObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) renderReaderPage(en.target);
        else if (total > 8) releaseReaderPage(en.target);   // long issues: free pages that are far away
      });
    }, { root: body, rootMargin: "800px 0px" });
    pages.querySelectorAll(".reader-page").forEach((w) => readerPageObserver.observe(w));

    // "पान ३ / ८" follows the scrolling
    let queued = false;
    readerScrollHandler = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const box = body.getBoundingClientRect();
        const mid = box.top + box.height / 2;
        let current = 1;
        pages.querySelectorAll(".reader-page").forEach((w) => {
          if (w.getBoundingClientRect().top <= mid) current = Number(w.dataset.page);
        });
        if (ind) ind.textContent = `पान ${toDevanagari(current)} / ${toDevanagari(total)}`;
      });
    };
    body.addEventListener("scroll", readerScrollHandler, { passive: true });
  } catch (err) {
    if (run !== readerRun) return;
    if (err && err.message === "missing") {
      readerMessage(`<i class="fa-regular fa-file-lines" style="font-size:32px"></i><strong>या अंकाचा PDF अजून उपलब्ध नाही.</strong><span>तो लवकरच जोडला जाईल.</span>`);
    } else {
      readerMessage(`<i class="fa-solid fa-triangle-exclamation" style="font-size:30px"></i><strong>PDF येथे दाखवता आला नाही.</strong><span>कृपया तो नवीन टॅबमध्ये उघडा किंवा डाउनलोड करा.</span>
        <div class="reader-fallback"><a class="btn-reader" href="${url}" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> नवीन टॅबमध्ये उघडा</a><a class="btn-reader" href="${url}" download><i class="fa-solid fa-download"></i> डाउनलोड</a></div>`);
    }
  }
}

async function renderReaderPage(wrap) {
  if (wrap.dataset.state) return;           // already drawn / being drawn
  const run = readerRun;
  const doc = readerDoc;
  if (!doc) return;
  wrap.dataset.state = "busy";
  try {
    const page = await doc.getPage(Number(wrap.dataset.page));
    if (run !== readerRun) return;
    const base = page.getViewport({ scale: 1 });
    const cssWidth = wrap.clientWidth || 600;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);     // sharp enough, light enough for phones
    const viewport = page.getViewport({ scale: (cssWidth / base.width) * dpr });
    const canvas = document.createElement("canvas");
    canvas.className = "reader-canvas";
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    if (run !== readerRun) return;
    wrap.style.aspectRatio = `${base.width} / ${base.height}`;
    wrap.appendChild(canvas);
    wrap.dataset.state = "done";
  } catch (e) {
    if (run === readerRun) delete wrap.dataset.state;
  }
}

function releaseReaderPage(wrap) {
  if (wrap.dataset.state !== "done") return;
  const canvas = wrap.querySelector("canvas");
  if (canvas) { canvas.width = 0; canvas.height = 0; canvas.remove(); }
  delete wrap.dataset.state;
}

// Open the PDF e-paper of an issue (no argument = the latest issue)
window.openWeeklyModal = function(idOrNothing) {
  const byId = typeof idOrNothing === "number" ? articlesData.find((a) => a.id === idOrNothing) : null;
  const issue = byId && byId.issue ? byId : latestIssue();
  currentModalArticle = issue;

  const modal = document.getElementById("weekly-epaper-modal");
  if (!modal) return;
  const url = pdfUrlFor(issue);
  const title = document.getElementById("reader-title");
  if (title) title.innerHTML = `<i class="fa-solid fa-file-pdf" style="color:var(--accent-red); margin-right:6px"></i> अंक ${toDevanagari(issue.issue)} • साप्ताहिक ई-पेपर`;
  const dl = document.getElementById("reader-download");
  if (dl) { dl.href = url; dl.setAttribute("download", `Lokmangal-Weekly-${issue.issue}.pdf`); }
  const open = document.getElementById("reader-open");
  if (open) open.href = url;

  showModal(modal);
  loadReader(url);
};

window.closeModals = function(silent) {
  const wasOpen = !!document.querySelector(".modal-overlay.active");
  const reader = document.getElementById("weekly-epaper-modal");
  if (reader && reader.classList.contains("active")) resetReader();   // free the PDF pages
  document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
  syncScrollLock();
  if (wasOpen && focusBeforeModal && document.contains(focusBeforeModal)) {
    focusBeforeModal.focus({ preventScroll: true });
  }
  focusBeforeModal = null;
  if (wasOpen && silent !== true) releaseOverlayHistory();
};

// Listen to Escape key & click outside
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModals();
    closeDrawer();
    closeSearchBar();
  }
});

document.querySelectorAll(".modal-overlay").forEach(modal => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModals();
  });
});

// Download the real PDF of an issue (the reader / cards use plain download links; this stays for any old inline call)
window.downloadWeeklyPDF = function(issueNo) {
  const issue = (typeof issueNo === "number" ? issueByNo(issueNo) : null) || currentModalArticle || latestIssue();
  const a = document.createElement("a");
  a.href = pdfUrlFor(issue);
  a.download = `Lokmangal-Weekly-${issue.issue}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast(`📥 साप्ताहिक आवृत्ती (अंक ${toDevanagari(issue.issue)}) PDF डाऊनलोड होत आहे...`);
};

// Speech reader
window.toggleReadAloud = function(articleId) {
  if (!('speechSynthesis' in window)) {
    showToast("ऑडिओ वाचन उपलब्ध नाही.");
    return;
  }
  const article = articlesData.find(a => a.id === articleId) || articlesData[0];
  const utter = new SpeechSynthesisUtterance(article.title + ". " + article.excerpt);
  utter.lang = "mr-IN";
  window.speechSynthesis.speak(utter);
  showToast("🔊 बातमी वाचन सुरू झाले...");
};

// Back to top
function initBackToTop() {
  const btn = document.getElementById("back-top");
  if (!btn) return;
  let queued = false;
  const update = () => {
    btn.style.display = window.scrollY > 300 ? "flex" : "none";
    queued = false;
  };
  // passive + one update per frame keeps scrolling smooth on slower phones
  window.addEventListener("scroll", () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
}

// Toast
window.showToast = function(msg) {
  let toast = document.getElementById("toast-bar");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-bar";
    toast.className = "toast-bar";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
};
