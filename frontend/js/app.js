/**
 * LOKMANGAL NEWS PORTAL (लोकमंगल न्यूज पोर्टल)
 * JavaScript Engine for 3-Column Xapify Architecture
 */

// --- Articles Dataset ---
let articlesData = [
  {
    id: 1,
    title: "सोलापूर दक्षिण विधानसभा निवडणूक: आमदार सुभाष बापू देशमुख यांचा ऐतिहासिक विजय; ७७ हजारांहून अधिक मताधिक्याने विरोधकांचा पराभव",
    category: "rajkiy",
    categoryLabel: "राजकीय",
    author: "विशेष राजकीय प्रतिनिधी",
    date: "१३ ऑक्टोबर २०२६",
    image: "assets/images/bapu_portrait_lead.jpg",
    excerpt: "सोलापूर दक्षिण विधानसभा मतदारसंघात महायुती व भारतीय जनता पक्षाचे उमेदवार आमदार सुभाष (बापू) देशमुख यांनी १,१६,९३२ मते मिळवत तब्बल ७७,१२७ मतांच्या विक्रमी फरकाने दणदणीत विजय संपादन केला.",
    content: `
      <p><strong>सोलापूर:</strong> सोलापूर दक्षिण विधानसभा मतदारसंघातील अत्यंत चुरशीच्या ठरलेल्या निवडणुकीत भाजपचे ज्येष्ठ नेते व माजी सहकार मंत्री आमदार सुभाष (बापू) सुरेशचंद्र देशमुख यांनी ऐतिहासिक विजय साकारला आहे. या निवडणुकीत महायुतीकडून मैदानात उतरलेल्या सुभाष देशमुखांनी १ लाख १६ हजार ९३२ इतकी विक्रमी मते मिळवली. त्यांचे नजीकचे प्रतिस्पर्धी शिवसेनेचे (उबाठा) अमर रतिकांत पाटील यांना ३९,८०५ मते मिळाली असून, देशमुखांनी तब्बल ७७,१२७ मतांच्या प्रचंड फरकाने हा दणदणीत विजय मिळवला.</p>
      <p>सुभाष बापू देशमुख यांचा सोलापूर दक्षिण मतदारसंघातील हा सलग तिसरा विजय असून, त्यांच्या नेतृत्वावर जनतेने पुन्हा एकदा दृढ विश्वास व्यक्त केला आहे. निकालाची घोषणा होताच सोलापूर शहर आणि दक्षिण तालुक्यात कार्यकर्त्यांनी फटाक्यांची आतषबाजी आणि गुलाल उधळत प्रचंड जल्लोष केला.</p>
      <p><strong>विजयी सभेत आमदार सुभाष देशमुख यांचे मनोगत:</strong> "हा विजय माझा नसून दक्षिण सोलापूरच्या जनतेचा, बळीराजाचा, माता-भगिनींचा आणि अहोरात्र कष्ट करणाऱ्या निष्ठावंत कार्यकर्त्यांचा आहे. जनतेने दिलेल्या या अभूतपूर्व जनादेशाचे ऋण मी मतदारसंघातील विकासाची गंगा अविरत वाहती ठेवून फेडेन," असा विश्वास देशमुखांनी व्यक्त केला.</p>
      <p>या निवडणुकीत ग्रामीण भागातील सिंचन प्रकल्प, ग्रामीण रस्ते, औद्योगिकीकरण आणि शेतकरी कल्याणकारी योजना या विषयांवर देशमुखांनी घेतलेल्या ठोस भूमिकेला मतदारांनी भरभरून कौल दिला.</p>
    `,
    views: "34.8K"
  },
  // ==========================================
  // 2. सामाजिक (Samajik - Lokmangal Foundation)
  // ==========================================
  {
    id: 2,
    title: "लोकमंगल फाऊंडेशनतर्फे सोलापूरमध्ये भव्य 'सर्वधर्मीय सामुदायिक विवाह सोहळा'; शेकडो जोडप्यांचे विनामूल्य शुभमंगल!",
    category: "samajik",
    categoryLabel: "सामाजिक",
    author: "लोकमंगल सामाजिक प्रतिनिधी",
    date: "१३ ऑक्टोबर २०२६",
    image: "assets/images/lokmangal_vivah_01.jpg",
    excerpt: "संस्थापक सुभाष बापू देशमुख यांच्या प्रेरणेने आयोजित सर्वधर्मीय सामुदायिक विवाह सोहळ्यात शेकडो जोडप्यांचा विवाह संपन्न; वधू-वरांना मोफत मंगळसूत्र, संसारोपयोगी भांडी व मानाचा आहेर देऊन पाठीशी उभे राहिले लोकमंगल फाऊंडेशन.",
    content: `
      <p><strong>सोलापूर:</strong> आर्थिकदृष्ट्या दुर्बल कुटुंबांना विवाहाचा मोठा खर्च परवडत नसल्यामुळे शेतकरी व कष्टकरी वर्गावर कर्जाचा डोंगर उभा राहतो. या सामाजिक समस्येवर मात करण्यासाठी आणि सर्वधर्म समभाव जोपासण्यासाठी लोकमंगल फाऊंडेशनच्या वतीने सोलापूरमध्ये यंदाही भव्य सर्वधर्मीय सामुदायिक विवाह सोहळ्याचे शानदार आयोजन करण्यात आले.</p>
      <p>संस्थापक अध्यक्ष सुभाष बापू देशमुख यांच्या संकल्पनेतून गेली दोन दशके अविरतपणे राबवल्या जाणाऱ्या या उपक्रमात यंदाही शेकडो जोडप्यांचा विवाह धार्मिक रीतीरिवाजांनुसार उत्साहात पार पडला. फाऊंडेशनतर्फे सहभागी प्रत्येक वधू-वराला विवाहाचे कपडे, हळदीचे पोषाख, वधूस मानाचे सुवर्ण मंगळसूत्र, जोडवे आणि संसाराला उपयुक्त पडणारा ५१ भांड्यांचा संपूर्ण संच विनामूल्य भेट देण्यात आला.</p>
      <p><strong>हजारो नातेवाईकांसाठी भोजन व व्यवस्था:</strong> सोहळ्यात सहभागी झालेल्या सर्व जोडप्यांच्या नातेवाईकांसाठी आणि वऱ्हाडी मंडळींसाठी चवदार महाप्रसादाची भव्य व्यवस्था करण्यात आली होती. तसेच स्त्री भ्रूणहत्या प्रतिबंध आणि कौटुंबिक आरोग्य याविषयी वधू-वरांचे समुपदेशनही करण्यात आले.</p>
      <p>"सामुदायिक विवाह ही काळाची गरज असून यामुळे गरीब शेतकरी आत्महत्येच्या गर्तेत जाण्यापासून वाचतो. हा सोहळा म्हणजे केवळ विवाह नसून सामाजिक क्रांतीचे पाऊल आहे," असे प्रतिपादन लोकमंगल फाऊंडेशनच्या पदाधिकाऱ्यांनी केले.</p>
    `,
    views: "29.4K"
  },
  // ==========================================
  // 3. राजकीय (Rajkiy - Subhash Bapu Deshmukh)
  // ==========================================
  {
    id: 3,
    title: "सोलापूर शहर व जिल्हा भाजपच्या नवीन कोअर कमिटीत आमदार सुभाष बापू देशमुख यांचा समावेश; आगामी महापालिका रणनीती निश्चित",
    category: "rajkiy",
    categoryLabel: "राजकीय",
    author: "सोलापूर राजकीय ब्युरो",
    date: "१२ ऑक्टोबर २०२६",
    image: "assets/images/bapu_banner_assembly.webp",
    excerpt: "भारतीय जनता पक्षाने सोलापूर शहर आणि पूर्व विभागाची नवीन १३ सदस्यीय कोअर कमिटी जाहीर केली असून यामध्ये ज्येष्ठ नेते आमदार सुभाष देशमुख यांना पक्षाच्या निर्णय प्रक्रियेत मानाचे स्थान देण्यात आले आहे.",
    content: `
      <p><strong>सोलापूर:</strong> भारतीय जनता पक्षाच्या प्रदेश नेतृत्वाने सोलापूर शहर व पूर्व विभागाच्या संघटनेला नवी उभारी देण्यासाठी १३ सदस्यीय विशेष कोअर कमिटीची घोषणा केली आहे. यामध्ये पक्षाचे ज्येष्ठ नेते आणि दक्षिण सोलापूरचे आमदार सुभाष (बापू) देशमुख यांचा समावेश करण्यात आला आहे.</p>
      <p>गेल्या काही महिन्यांच्या राजकीय घडामोडींनंतर सुभाष देशमुख यांना पक्षाच्या सर्वोच्च स्थानिक निर्णय मंडळात पुन्हा मानाचे स्थान मिळाल्याने कार्यकर्त्यांमध्ये प्रचंड उत्साहाचे वातावरण निर्माण झाले आहे. आगामी सोलापूर महानगरपालिका, जिल्हा परिषद आणि पंचायत समिती निवडणुकांच्या पार्श्वभूमीवर ही समिती पक्षीय व्यूहरचना आखणार आहे.</p>
      <p>कोअर कमिटीच्या पहिल्याच आढावा बैठकीत आमदार सुभाष देशमुख यांनी मार्गदर्शन करताना सांगितले की, "सोलापूरच्या विकासासाठी आणि सामान्य जनतेच्या विश्वासाला पात्र ठरण्यासाठी पक्षाच्या सर्व पदाधिकाऱ्यांनी व कार्यकर्त्यांनी एकदिलाने काम केले पाहिजे. केंद्र व राज्य सरकारच्या लोकोपयोगी योजना शेवटच्या घटकापर्यंत पोहोचवणे हेच आमचे प्रमुख उद्दिष्ट राहील."</p>
    `,
    views: "21.6K"
  },
  // ==========================================
  // 4. सामाजिक (Samajik - Lokmangal Annapurna)
  // ==========================================
  {
    id: 4,
    title: "'लोकमंगल अन्नपूर्णा योजना': सोलापुरातील गरजू, निराधार व ज्येष्ठ नागरिकांच्या घरापर्यंत दररोज मोफत पोषक डबा पोहोचवणारा आधारवड",
    category: "samajik",
    categoryLabel: "सामाजिक",
    author: "स्नेहल पाटील (सामाजिक प्रतिनिधी)",
    date: "१२ ऑक्टोबर २०२६",
    image: "assets/images/lokmangal_annapurna_01.jpg",
    excerpt: "दोन वेळच्या अन्नासाठी वंचित असणाऱ्या हजारो ज्येष्ठ नागरिक, दिव्यांग व निराधार व्यक्तींसाठी लोकमंगल अन्नपूर्णा योजना जीवनदान ठरत असून, स्वच्छता आणि प्रेमाने तयार केलेले टिफिन थेट घराघरापर्यंत पोहोचवले जातात.",
    content: `
      <p><strong>सोलापूर:</strong> "भुकेलेल्याला घास आणि तहानलेल्याला पाणी" या ब्रीदवाक्याला प्रत्यक्ष कृतीत उतरवणारी 'लोकमंगल अन्नपूर्णा योजना' आज सोलापूर शहरातील हजारो वयोवृद्ध आणि निराधार बांधवांचा खराखुरा आधार बनली आहे. लोकमंगल फाऊंडेशनचे संस्थापक सुभाष बापू देशमुख यांच्या संवेदनशील दृष्टिकोनातून हा उपक्रम सुरू करण्यात आला.</p>
      <p>अनेक वृद्ध दांपत्ये किंवा निराधार व्यक्ती अशा असतात ज्यांना आजारपणामुळे अथवा गरिबीमुळे स्वतःसाठी जेवण बनवणे शक्य नसते. अशा कुटुंबांचा शोध घेऊन लोकमंगलचे स्वयंसेवक दररोज दुपारी आणि संध्याकाळी गरम, ताजा आणि पोषणयुक्त भोजनाचा डबा त्यांच्या निवासस्थानी पोहोचवतात.</p>
      <p><strong>स्वच्छता आणि गुणवत्तेवर विशेष भर:</strong> लोकमंगलच्या मध्यवर्ती स्वयंपाकघरामध्ये अत्यंत शुद्ध व सात्त्विक अन्न तयार केले जाते. यामध्ये चपाती, भाजी, डाळ-भात आणि पौष्टिक घटकांचा समतोल असतो. आजवर हजारो कुटुंबांनी या योजनेचा लाभ घेतला असून, अनेक ज्येष्ठ नागरिकांनी कृतज्ञतेने लोकमंगलच्या या सेवेचे तोंडभरून कौतुक केले आहे.</p>
    `,
    views: "18.3K"
  },
  // ==========================================
  // 5. राजकीय (Rajkiy - Subhash Bapu Deshmukh)
  // ==========================================
  {
    id: 5,
    title: "सोलापूर जिल्हा मध्यवर्ती बँक (DCC Bank) निवडणूक: आमदार सुभाष बापू देशमुखांचा ठराव मंजूर; सहकार क्षेत्रातील हालचालींना वेग",
    category: "rajkiy",
    categoryLabel: "राजकीय",
    author: "सहकार वार्ता प्रतिनिधी",
    date: "११ ऑक्टोबर २०२६",
    image: "assets/images/bapu_review_meet.webp",
    excerpt: "सोलापूर डीसीसी बँकेच्या निवडणुकीच्या पार्श्वभूमीवर लोकमंगल बँकेचे मतदार प्रतिनिधी म्हणून आमदार सुभाष देशमुख यांचा ठराव मंजूर झाला असून, जिल्हा बँकेत पारदर्शकता व शेतकरी हितासाठी त्यांनी आवाज उठवला आहे.",
    content: `
      <p><strong>सोलापूर:</strong> सोलापूर जिल्हा मध्यवर्ती सहकारी बँक (DCC Bank) निवडणुकीच्या राजकीय आखाड्यात ज्येष्ठ सहकार नेते तथा आमदार सुभाष (बापू) देशमुख यांची दमदार एन्ट्री झाली आहे. लोकमंगल नागरी सहकारी बँकेचे अधिकृत प्रतिनिधी म्हणून सुभाष देशमुख यांच्या नावाचा ठराव एकमुखाने मंजूर करण्यात आला आहे.</p>
      <p>सुभाष देशमुख यांनी यापूर्वी महाराष्ट्राचे सहकार मंत्री म्हणून सहकार क्षेत्रातील भ्रष्टाचार रोखण्यासाठी आणि सहकारी बँकांना आर्थिक शिस्त लावण्यासाठी महत्त्वपूर्ण कायदेशीर पावले उचलली होती. आता सोलापूर डीसीसी बँकेच्या निवडणुकीत त्यांच्या सक्रीय सहभागामुळे संपूर्ण जिल्ह्याच्या सहकार क्षेत्रातील समीकरणांना कलाटणी मिळाली आहे.</p>
      <p><strong>विभागीय सहनिबंधकांकडे पारदर्शकतेची मागणी:</strong> ठराव प्रक्रियेत गैरप्रकार होऊ नयेत आणि सर्व प्राथमिक सहकारी सोसायट्यांना समान मताधिकार मिळावा यासाठी आमदार देशमुखांनी सहकार खात्याकडे नियमांचे काटेकोर पालन करण्याचे लेखी निवेदन दिले आहे. "जिल्हा मध्यवर्ती बँक ही सामान्य शेतकऱ्यांच्या घामाच्या पैशातून उभी राहिली आहे. या बँकेवर शेतकऱ्यांच्या हिताचेच रक्षण झाले पाहिजे," असा स्पष्ट इशारा देशमुखांनी दिला.</p>
    `,
    views: "24.1K"
  },
  // ==========================================
  // 6. सामाजिक (Samajik - Lokmangal Jalkranti)
  // ==========================================
  {
    id: 6,
    title: "दुष्काळमुक्तीसाठी 'लोकमंगल जलक्रांती': १०० हून अधिक गावांत नाला खोलीकरण व सिमेंट बंधारे; भूजल पातळीत लक्षणीय वाढ",
    category: "samajik",
    categoryLabel: "सामाजिक",
    author: "आनंद मोहिते (जलदूत)",
    date: "११ ऑक्टोबर २०२६",
    image: "assets/images/lokmangal_jalkranti_01.jpg",
    excerpt: "पाणीटंचाईवर कायमस्वरूपी मात करण्यासाठी लोकमंगल फाऊंडेशनने दुष्काळी गावांमध्ये जलसंधारणाची महामोहीम राबवली; हजारो एकर शेतीला संरक्षित सिंचनाचा लाभ.",
    content: `
      <p><strong>सोलापूर:</strong> सोलापूर आणि शेजारच्या धाराशिव जिल्ह्यातील दुष्काळग्रस्त भागाला पाण्यासाठी दरवर्षी टँकरवर अवलंबून राहावे लागत होते. या संकटावर कायमस्वरूपी मात करण्यासाठी लोकमंगल फाऊंडेशनने 'लोकमंगल जलक्रांती' ही लोकसहभागाची भव्य चळवळ हाती घेतली.</p>
      <p>फाऊंडेशनच्या अवजड मशनरींच्या साहाय्याने सोलापूर दक्षिण, उत्तर आणि बार्शी परिसरातील १०० हून अधिक गावांमध्ये नाला खोलीकरण, गाळ उपसा, सिमेंट नाला बांध आणि शेततळ्यांचे काम युद्धपातळीवर पूर्ण करण्यात आले. पावसाळ्यात पडणाऱ्या पाण्याचा प्रत्येक थेंब अडवून जमिनीत जिरवल्यामुळे परिसरातील विहिरी आणि कूपनलिकांच्या पाणीपातळीत तब्बल ४ ते ६ फुटांची वाढ नोंदवण्यात आली आहे.</p>
      <p><strong>शेतकऱ्यांच्या शेतात हिरवेगार पिके:</strong> पाणी उपलब्ध झाल्यामुळे शेतकऱ्यांना रब्बी हंगामात कांदा, ज्वारी आणि भाजीपाल्याचे भरघोस उत्पादन घेणे शक्य झाले आहे. अनेक गावांनी टँकरमुक्त गाव म्हणून स्वाभिमानाने घोषणा केली असून, ग्रामस्थांनी लोकमंगलच्या या भगीरथ प्रयत्नांना मनःपूर्वक धन्यवाद दिले आहेत.</p>
    `,
    views: "22.7K"
  },
  // ==========================================
  // 7. राजकीय (Rajkiy - Subhash Bapu Deshmukh)
  // ==========================================
  {
    id: 7,
    title: "केंद्रीय रस्ते वाहतूक मंत्री नितीन गडकरी यांची आमदार सुभाष देशमुख यांच्या निवासस्थानी सदिच्छा भेट; सोलापूर रिंग रोड व महामार्ग प्रकल्पांवर चर्चा",
    category: "rajkiy",
    categoryLabel: "राजकीय",
    author: "विशेष राजकीय वार्ताहर",
    date: "१० ऑक्टोबर २०२६",
    image: "assets/images/bapu_subhash_deshmukh.jpg",
    excerpt: "सोलापूर दौऱ्यावर आलेले केंद्रीय मंत्री नितीन गडकरी यांनी आमदार सुभाष देशमुख यांच्या निवासस्थानी सदिच्छा भेट देऊन सोलापूरच्या बाह्यवळण रस्ता (रिंग रोड), उड्डाणपूल आणि औद्योगिक कनेक्टिव्हिटीबाबत सखोल चर्चा केली.",
    content: `
      <p><strong>सोलापूर:</strong> केंद्रीय रस्ते वाहतूक आणि महामार्ग मंत्री नितीन गडकरी यांनी सोलापूर दौऱ्यादरम्यान दक्षिण सोलापूरचे आमदार सुभाष (बापू) देशमुख यांच्या निवासस्थानी सदिच्छा भेट दिली. या भेटीदरम्यान दोन्ही ज्येष्ठ नेत्यांमध्ये सोलापूर शहराचा व ग्रामीण भागाचा पायाभूत विकास, राष्ट्रीय महामार्गांचे जाळे आणि उद्योगवाढीबाबत महत्त्वपूर्ण चर्चा झाली.</p>
      <p>आमदार सुभाष देशमुख यांनी सोलापूर शहराभोवती नियोजित रिंग रोडचे काम वेगाने पूर्ण करणे, सोलापूर-विजयपूर महामार्गावरील उड्डाणपूल आणि ग्रामीण जोड रस्त्यांचे काँक्रिटीकरण यासाठी गडकरींकडे विशेष निधीची मागणी केली. या मागण्यांना केंद्रीय मंत्र्यांनी सकारात्मक प्रतिसाद देत राष्ट्रीय महामार्ग प्राधिकरणाच्या अधिकाऱ्यांना तात्काळ आवश्यक सर्वेक्षण करण्याचे निर्देश दिले.</p>
      <p>या सदिच्छा भेटीमुळे सोलापूर जिल्ह्यातील भाजपच्या कार्यकर्त्यांमध्ये नवचैतन्य निर्माण झाले असून, रस्ते विकासामुळे सोलापूरच्या वस्त्रोद्योगाला आणि कृषी माल वाहतुकीला मोठी गती मिळणार आहे.</p>
    `,
    views: "27.3K"
  },
  // ==========================================
  // 8. सामाजिक (Samajik - Lokmangal Health)
  // ==========================================
  {
    id: 8,
    title: "लोकमंगल महा-आरोग्य तपासणी शिबिर व रक्तदान मोहीम: ५,००० हून अधिक नागरिकांची मोफत तपासणी, औषधोपचार व मोतीबिंदू शस्त्रक्रिया",
    category: "samajik",
    categoryLabel: "सामाजिक",
    author: "आरोग्य डेस्क",
    date: "१० ऑक्टोबर २०२६",
    image: "assets/images/lokmangal_arogya_shibir.jpg",
    excerpt: "ग्रामीण जनतेच्या आरोग्याची काळजी घेण्यासाठी लोकमंगल फाऊंडेशनतर्फे तज्ज्ञ डॉक्टरांच्या उपस्थितीत भव्य महा-आरोग्य शिबिर संपन्न; शेकडो रुग्णांना मोफत चष्मे वाटप व शस्त्रक्रियांचे नियोजन.",
    content: `
      <p><strong>सोलापूर:</strong> ग्रामीण भागात आरोग्य सुविधांचा अभाव आणि उपचाराचा मोठा खर्च यामुळे अनेक गरीब रुग्ण उपचारांपासून वंचित राहतात. यावर मात करण्यासाठी लोकमंगल फाऊंडेशनच्या वतीने भव्य महा-आरोग्य तपासणी शिबिर आणि रक्तदान मोहिमेचे यशस्वी आयोजन करण्यात आले.</p>
      <p>पुणे, मुंबई आणि सोलापूर येथील नामवंत हृदयरोग तज्ज्ञ, नेत्ररोग तज्ज्ञ, स्त्रीरोग तज्ज्ञ आणि बालरोग तज्ज्ञांच्या पथकाने ५,००० हून अधिक ग्रामस्थांची मोफत आरोग्य तपासणी केली. शिबिरात मोफत ईसीजी, रक्ततपासणी, शुगर आणि बीपी तपासणी करण्यात आली. गरजू रुग्णांना आवश्यक ती सर्व औषधे मोफत वाटण्यात आली.</p>
      <p><strong>मोफत मोतीबिंदू शस्त्रक्रिया व रक्तदान:</strong> तपासणीत मोतीबिंदू आढळलेल्या ३०० हून अधिक ज्येष्ठ नागरिकांवर लोकमंगलतर्फे संपूर्णपणे विनामूल्य शस्त्रक्रिया करण्यात येणार आहेत. तसेच युवकांनी उत्स्फूर्त सहभाग घेत ३५० हून अधिक रक्त पिशव्यांचे संकलन करून सोलापूर जिल्ह्यातील रक्तपेढ्यांची गरज भागवली.</p>
    `,
    views: "19.8K"
  },
  // ==========================================
  // 9. राजकीय (Rajkiy - Subhash Bapu Deshmukh)
  // ==========================================
  {
    id: 9,
    title: "दक्षिण सोलापूर मतदारसंघातील रस्ते, सिंचन व पाणीपुरवठ्यासाठी कोट्यवधींच्या विकासकामांचे भूमिपूजन: आमदार सुभाष देशमुख",
    category: "rajkiy",
    categoryLabel: "राजकीय",
    author: "ग्रामीण विकास वार्ताहर",
    date: "०९ ऑक्टोबर २०२६",
    image: "assets/images/lokmangal_jalkranti_02.jpg",
    excerpt: "दक्षिण सोलापूर तालुक्यातील प्रत्येक गावाला दर्जेदार रस्ते आणि शुद्ध पिण्याचे पाणी उपलब्ध करून देण्यासाठी शासनाकडून मंजूर झालेल्या कोट्यवधी रुपयांच्या विविध विकासकामांचा शुभारंभ आमदार सुभाष देशमुखांच्या हस्ते संपन्न.",
    content: `
      <p><strong>दक्षिण सोलापूर:</strong> मतदारसंघातील ग्रामीण भागाचा चेहरामोहरा बदलण्यासाठी कटिबद्ध असल्याचे सांगत आमदार सुभाष (बापू) देशमुख यांनी तालुक्यातील विविध गावांमधील रस्ते डांबरीकरण, जलजीवन मिशन अंतर्गत पाणीपुरवठा योजना आणि भूमिगत गटार कामांचे भूमिपूजन केले.</p>
      <p>आमदार सुभाष देशमुखांच्या सातत्यपूर्ण पाठपुराव्यामुळे राज्य सरकारच्या अर्थसंकल्पातून दक्षिण सोलापूरसाठी कोट्यवधी रुपयांचा विशेष विकासनिधी मंजूर झाला आहे. यामध्ये ग्रामीण रुग्णालयांचे श्रेणीवर्धन, प्राथमिक आरोग्य उपकेंद्रांची दुरुस्ती आणि शेती पंपांना सुरळीत थ्री-फेज वीज पुरवठा करण्यासाठी नवीन ट्रान्सफॉर्मर बसवण्याच्या कामांचा समावेश आहे.</p>
      <p>"प्रत्येक नागरिकाच्या मूलभूत गरजा पूर्ण करणे आणि गावे स्वयंपूर्ण बनवणे हेच आमचे राजकारण आहे. निवडणुका संपल्या की आम्ही फक्त विकासाचा विचार करतो," असे प्रतिपादन देशमुखांनी गावबैठकांमध्ये केले.</p>
    `,
    views: "17.9K"
  },
  // ==========================================
  // 10. सामाजिक (Samajik - Lokmangal Krishi)
  // ==========================================
  {
    id: 10,
    title: "लोकमंगल कृषी व ऊस उत्पादक शेतकरी मार्गदर्शन मेळावा: ठिबक सिंचन, आधुनिक खत व्यवस्थापन आणि उच्च उत्पादन तंत्रज्ञान",
    category: "samajik",
    categoryLabel: "सामाजिक",
    author: "कृषी वार्ता विशेष",
    date: "०९ ऑक्टोबर २०२६",
    image: "assets/images/lokmangal_what_we_do.jpg",
    excerpt: "ऊस उत्पादक शेतकऱ्यांना एकरी १०० टन उत्पादन गाठण्यासाठी आधुनिक कृषी तंत्रज्ञान, ठिबक सिंचन व सेंद्रिय खतांचा संतुलित वापर याविषयी कृषी तज्ज्ञांकडून सखोल मार्गदर्शन संपन्न.",
    content: `
      <p><strong>सोलापूर:</strong> शेतीतील उत्पादन खर्च कमी करून बळीराजाचे उत्पन्न दुप्पट करण्याच्या उद्देशाने लोकमंगल समूहाच्या वतीने भव्य कृषी व ऊस उत्पादक शेतकरी मार्गदर्शन मेळावा आयोजित करण्यात आला. या मेळाव्यात सोलापूर आणि आसपासच्या परिसरातील हजारो शेतकऱ्यांनी हजेरी लावली.</p>
      <p>वसंतदादा शुगर इन्स्टिट्यूट (VSI) आणि महात्मा फुले कृषी विद्यापीठातील तज्ज्ञ शास्त्रज्ञांनी उसाच्या सुधारित जाती, बेणे प्रक्रिया, ठिबक सिंचनातून विद्राव्य खतांचे व्यवस्थापन आणि कीड नियंत्रणावर प्रात्यक्षिकांसह मार्गदर्शन केले. लोकमंगल समूहाकडून आधुनिक कृषी अवजारांचे प्रदर्शनही भरवण्यात आले होते.</p>
      <p>यावेळी शेतकऱ्यांना मार्गदर्शन करताना सांगण्यात आले की, कमी पाण्यात जास्तीत जास्त दर्जेदार उत्पादन घेणे ही आजची गरज आहे. लोकमंगलच्या वतीने शेतकऱ्यांना सुलभ हप्त्यांवर ठिबक संच आणि दर्जेदार सेंद्रिय खते उपलब्ध करून दिली जात आहेत.</p>
    `,
    views: "23.1K"
  },
  // ==========================================
  // 11. राजकीय (Rajkiy - Subhash Bapu Deshmukh)
  // ==========================================
  {
    id: 11,
    title: "'सहकार चळवळ हा ग्रामीण महाराष्ट्राचा प्राण': माजी सहकार मंत्री सुभाष देशमुख यांचे राज्यस्तरीय परिषदेत परखड प्रतिपादन",
    category: "rajkiy",
    categoryLabel: "राजकीय",
    author: "राज्य ब्युरो",
    date: "०८ ऑक्टोबर २०२६",
    image: "assets/images/bapu_foundation_portrait.jpg",
    excerpt: "सहकारी संस्थांनी आधुनिक तंत्रज्ञान आणि पारदर्शकता अंगीकारली तरच ग्रामीण अर्थव्यवस्था बळकट होईल; सहकारी साखर कारखाने आणि बँकांच्या सक्षमीकरणावर भर देण्याचे माजी सहकार मंत्री सुभाष देशमुखांचे आवाहन.",
    content: `
      <p><strong>पुणे:</strong> महाराष्ट्र राज्य सहकारी परिषदेत प्रमुख वक्ते म्हणून बोलताना माजी सहकार व पणन मंत्री आमदार सुभाष (बापू) देशमुख यांनी राज्यातील सहकार क्षेत्राच्या सद्यस्थितीवर आणि भविष्यातील दिशांवर परखड विचार मांडले.</p>
      <p>देशमुख म्हणाले, "महाराष्ट्रातील सहकार चळवळीने ग्रामीण जनतेला आर्थिक स्वातंत्र्य मिळवून दिले आहे. मात्र बदलत्या काळात सहकारी साखर कारखान्यांनी केवळ साखरेवर अवलंबून न राहता इथेनॉल, सीबीजी (बायो-गॅस) आणि को-जनरेशन वीजनिर्मितीकडे वळले पाहिजे. पारदर्शक कारभार आणि व्यावसायिक व्यवस्थापन हेच सहकाराचे तारणहार आहेत."</p>
      <p>सहकार मंत्रिपदाच्या कार्यकाळात त्यांनी केलेल्या सहकार कायद्यातील सुधारणा आणि संगणकीकरणाच्या उपक्रमांची उपस्थितांनी प्रशंसा केली. सहकारातील निष्पक्षतेसाठी सुभाष देशमुखांचे विचार नेहमीच दिशादर्शक ठरतात, असे मत सहकार तज्ज्ञांनी व्यक्त केले.</p>
    `,
    views: "18.5K"
  },
  // ==========================================
  // 12. सामाजिक (Samajik - Lokmangal Udyogini)
  // ==========================================
  {
    id: 12,
    title: "महिला आर्थिक सक्षमीकरणासाठी 'लोकमंगल उद्योगिनी प्रदर्शन व विक्री मेळावा': बचत गटांच्या उत्पादनांना हक्काची बाजारपेठ",
    category: "samajik",
    categoryLabel: "सामाजिक",
    author: "महिला विकास मंच",
    date: "०८ ऑक्टोबर २०२६",
    image: "assets/images/lokmangal_vidyadaan_04.jpg",
    excerpt: "ग्रामीण भागातील ३०० हून अधिक महिला बचत गटांनी तयार केलेल्या दर्जेदार उत्पादनांना व्यासपीठ मिळवून देणारा लोकमंगल उद्योगिनी मेळावा उत्साहात; लाखोंची उलाढाल आणि महिलांचा आत्मविश्वास दुणावला.",
    content: `
      <p><strong>सोलापूर:</strong> ग्रामीण भागातील महिलांना स्वतःच्या पायावर उभे करण्यासाठी आणि त्यांच्या कौशल्याला योग्य मोबदला मिळवून देण्यासाठी लोकमंगल फाऊंडेशनच्या वतीने चार दिवसीय 'लोकमंगल उद्योगिनी प्रदर्शन व विक्री मेळावा' आयोजित करण्यात आला.</p>
      <p>या प्रदर्शनात सोलापूर जिल्ह्यातील बचत गटांनी तयार केलेले हातमाग कापड, पारंपरिक खाद्यपदार्थ, सेंद्रिय मसाले, हस्तकलेच्या शोभेच्या वस्तू आणि गृहोपयोगी साहित्यांचे १०० हून अधिक स्टॉल्स उभारण्यात आले होते. सोलापूरकरांनी प्रदर्शनाला उत्स्फूर्त प्रतिसाद देत लाखो रुपयांची खरेदी केली.</p>
      <p>लोकमंगल बँकेच्या सहकार्याने इच्छुक महिलांना स्वतःचा लघुउद्योग सुरू करण्यासाठी सुलभ वित्तपुरवठा आणि डिजिटल मार्केटिंगचे मोफत प्रशिक्षणही यावेळी देण्यात आले.</p>
    `,
    views: "16.4K"
  },
  // ==========================================
  // 13. राजकीय (Rajkiy - Subhash Bapu Deshmukh)
  // ==========================================
  {
    id: 13,
    title: "सीना व भीमा कालव्यांचे सिंचन आवर्तन वेळेवर सोडण्यासाठी आमदार सुभाष देशमुखांचे जलसंपदा विभागाला कडक निर्देश",
    category: "rajkiy",
    categoryLabel: "राजकीय",
    author: "कृषी व सिंचन कक्ष",
    date: "०७ ऑक्टोबर २०२६",
    image: "assets/images/lokmangal_jalkranti_04.jpg",
    excerpt: "रब्बी हंगामातील पिकांना पाण्याचा तुटवडा भासू नये आणि टेलच्या शेतकऱ्यांपर्यंत पाणी पोहोचावे यासाठी आमदार सुभाष बापू देशमुख यांनी जलसंपदा विभागाच्या वरिष्ठ अधिकाऱ्यांशी केली तातडीची बैठक.",
    content: `
      <p><strong>सोलापूर:</strong> दक्षिण सोलापूर आणि अक्कलकोट परिसरातील शेती पिकांना वेळेवर पाणी मिळण्यासाठी सीना-भीमा उपसा सिंचन योजना आणि उजनी डावा कालव्याचे आवर्तन तात्काळ सोडण्याचे कडक निर्देश आमदार सुभाष (बापू) देशमुख यांनी जलसंपदा विभागाच्या अधिकाऱ्यांना दिले आहेत.</p>
      <p>पाणी वाटप समितीच्या बैठकीत शेतकऱ्यांची कैफियत मांडताना देशमुखांनी स्पष्ट केले की, कालव्यांच्या शेवटच्या (टेल) टोकावरील शेतकऱ्यांपर्यंत पाण्याचा एकही थेंब पोहोचत नसल्याच्या तक्रारी खपवून घेतल्या जाणार नाहीत. कालव्यांची तातडीने दुरुस्ती करून पाण्याचा अपव्यय टाळावा, असे त्यांनी बजावले.</p>
      <p>आमदारांच्या आक्रमक भूमिकेनंतर जलसंपदा विभागाने कालव्यात पाणी सोडण्याचे वेळापत्रक जाहीर केले असून, यामुळे हजारो शेतकऱ्यांना मोठा दिलासा मिळाला आहे.</p>
    `,
    views: "15.7K"
  },
  // ==========================================
  // 14. सामाजिक (Samajik - Lokmangal Education)
  // ==========================================
  {
    id: 14,
    title: "'लोकमंगल शिक्षण संकुल व स्पर्धा परीक्षा केंद्र': ग्रामीण भागातील गुणवंत विद्यार्थ्यांना मोफत वाचनालय व करिअर मार्गदर्शन",
    category: "samajik",
    categoryLabel: "सामाजिक",
    author: "शिक्षण प्रतिनिधी",
    date: "०६ ऑक्टोबर २०२६",
    image: "assets/images/lokmangal_vidyadaan_01.jpg",
    excerpt: "एमपीएससी, यूपीएससी व पोलीस भरतीची तयारी करणाऱ्या ग्रामीण भागातील होतकरू तरुणांसाठी अत्याधुनिक डिजिटल लायब्ररी आणि तज्ज्ञ अधिकाऱ्यांचे मोफत मार्गदर्शन सत्र सुरू.",
    content: `
      <p><strong>सोलापूर:</strong> उच्च शिक्षणाची स्वप्ने पाहणाऱ्या मात्र आर्थिक अडचणींमुळे मागे पडणाऱ्या ग्रामीण तरुणांसाठी लोकमंगल शिक्षण प्रसारक मंडळाचे स्पर्धा परीक्षा केंद्र मार्गदर्शक दीपस्तंभ ठरत आहे.</p>
      <p>या केंद्रामध्ये मोफत वाय-फाय, ५,००० हून अधिक संदर्भ ग्रंथ, वातानुकूलित अभ्यासिका आणि ऑनलाईन टेस्ट सिरीजची सुविधा उपलब्ध करून देण्यात आली आहे. दर रविवारी यशस्वी सनदी अधिकारी आणि प्राध्यापकांची विशेष कार्यशाळा आयोजित केली जाते.</p>
      <p>गेल्या वर्षात या केंद्रातील ४० हून अधिक विद्यार्थ्यांनी शासकीय सेवा आणि पोलीस दलात यश संपादन करून लोकमंगलच्या शैक्षणिक सेवेचे चीज केले आहे.</p>
    `,
    views: "14.9K"
  },
  // ==========================================
  // 15. राजकीय (Rajkiy - Subhash Bapu Deshmukh)
  // ==========================================
  {
    id: 15,
    title: "दक्षिण सोलापूर तालुक्यात भव्य युवा कार्यकर्ता मेळावा; आमदार सुभाष देशमुखांचे आवाहन: 'सामान्य नागरिकांचे प्रश्न सोडवणे हीच आपली खरी ताकद'",
    category: "rajkiy",
    categoryLabel: "राजकीय",
    author: "युवा मंच ब्युरो",
    date: "०५ ऑक्टोबर २०२६",
    image: "assets/images/lokmangal_shivputra_event.jpg",
    excerpt: "भारतीय जनता युवा मोर्चाच्या वतीने आयोजित भव्य मेळाव्यात आमदार सुभाष बापू देशमुख यांनी युवकांना समाजकारण आणि राष्ट्रनिर्मितीसाठी पुढाकार घेण्याचे केले आवाहन.",
    content: `
      <p><strong>सोलापूर:</strong> दक्षिण सोलापूर तालुक्यातील हजारो तरुणांच्या उपस्थितीत संपन्न झालेल्या युवा कार्यकर्ता मेळाव्यात आमदार सुभाष (बापू) देशमुख यांनी युवकांना मार्गदर्शन केले. "तरुण पिढी ही देशाचे भविष्य आहे. राजकारण हे केवळ सत्तेसाठी नसून समाजसेवेचे प्रभावी माध्यम आहे," असे ते म्हणाले.</p>
      <p>शासनाच्या कौशल्य विकास योजना, मुद्रा कर्ज आणि स्टार्टअप योजनांचा लाभ प्रत्येक गावातील होतकरू युवकापर्यंत पोहोचवण्यासाठी विशेष हेल्पडेस्क सुरू करण्याची घोषणा देशमुखांनी यावेळी केली.</p>
    `,
    views: "16.1K"
  },
  // ==========================================
  // 16. सामाजिक (Samajik - Lokmangal Co-op Bank)
  // ==========================================
  {
    id: 16,
    title: "'लोकमंगल नागरी सहकारी बँक': शेतकरी व अल्प उत्पन्न कुटुंबांसाठी 'सुलभ कृषी व व्यवसाय कर्ज' योजनेचा शुभारंभ",
    category: "samajik",
    categoryLabel: "सामाजिक",
    author: "आर्थिक प्रतिनिधी",
    date: "०४ ऑक्टोबर २०२६",
    image: "assets/images/lokmangal_bank_banner.jpg",
    excerpt: "सामान्य शेतकरी, छोटे व्यावसायिक व महिला उद्योजकांना सावकारी पाशातून सोडवण्यासाठी लोकमंगल नागरी सहकारी बँकेने अत्यंत कमी व्याजदरात झटपट कर्ज योजना सुरू केली.",
    content: `
      <p><strong>सोलापूर:</strong> सहकाराच्या माध्यमातून सर्वसामान्यांचे आर्थिक सक्षमीकरण करणाऱ्या लोकमंगल नागरी सहकारी बँकेने आपल्या सर्व शाखांमध्ये विशेष 'सुलभ कृषी व व्यवसाय कर्ज' योजना कार्यान्वित केली आहे.</p>
      <p>कमीत कमी कागदपत्रे आणि जलद मंजुरी प्रक्रियेमुळे ग्रामीण भागातील लहान दुकानदार, शेतीपूरक व्यवसाय करणारे तरुण आणि शेतकरी यांना या योजनेचा मोठा आधार मिळणार आहे. पारदर्शक बँकिंग आणि ग्राहकाभिमुख सेवा हीच लोकमंगल बँकेची ओळख आहे.</p>
    `,
    views: "15.2K"
  },
  // ==========================================
  // Blogs
  // ==========================================
  {
    id: 17,
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
    id: 18,
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
  }
];

// --- Built-in weekly issues ----------------------------------------------------------------------------
// The issues of the Weekly Edition live in js/weekly-data.js (window.WEEKLY_ISSUES, loaded before this file):
//   { no, date, title, img, thumb, desc }   - no = 1 for the oldest issue, the highest number is the newest
// Issues added later in the Admin Panel (MySQL) reach the website through /api/weekly and are merged into these.
// With no issue at all the Weekly page shows an empty card (weeklyEmptyHTML).
const PAST_WEEKLY_ISSUES = Array.isArray(window.WEEKLY_ISSUES) ? window.WEEKLY_ISSUES : [];

// Weekly PDFs on the website (js/config.js -> WEEKLY_PDF).
//   true  = "PDF online वाचा / download" for every issue that has its file in assets/pdf/ (the default).
//   false = no PDF anywhere: no buttons, tags, banner, headings or wording. The issues themselves (cover, title, date, page) stay.
const WEEKLY_PDF = !!(window.LOKMANGAL_CONFIG && window.LOKMANGAL_CONFIG.WEEKLY_PDF);
// without PDFs: leave out every sentence of a text that talks about the e-paper / PDF
const withoutPdfWords = (s) => (String(s || "").match(/[^.।]+[.।]?\s*/g) || []).filter((x) => !/PDF|ई-पेपर|ऑनलाईन वाचा/.test(x)).join("").trim();

// One weekly issue -> the article object the site renders. {no, date, title, img, thumb, views, desc}
// The built-in list above and the issues that come from the API (Admin Panel) are both built with it.
// The cover is the front page of the PDF (portrait); `thumb` is a small copy for the lists (without it the cover is used).
// Nothing is made up: the texts are the issue's own headline and short text; an issue without a short text has none.
// What a reader sees to tell the issues apart: the DATE of the issue (the number inside the site is only its key / order;
// the printed issue number of the PDFs restarts every year, so showing a counter would not match the front pages).
const issueLabel = (a) => (a && a.date) || "";
// Small copy of a cover for the lists: the covers of the weekly issues are assets/weekly/<no>.jpg and have a <no>-s.jpg next to them.
// (Issues that come from the database carry only the cover; any other picture is used as it is.)
const thumbOf = (img) => (/^assets\/weekly\/\d+\.jpg$/.test(String(img || "")) ? String(img).replace(/\.jpg$/, "-s.jpg") : img);
const hasViews = (v) => !!String(v == null ? "" : v).trim() && String(v).trim() !== "—";
const escText = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));   // also safe inside an attribute
// A SHORT text (summary, weekly introduction, video description) may carry bold / italic / underline and line breaks (Admin Panel writing boxes).
// inlineHTML: shown that way - everything is escaped first and only exactly those tags are switched on again. plainOf: the words only (search, speech).
const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };
const decodeEntities = (t) => String(t == null ? "" : t).replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (e) => ENTITIES[e]);
const inlineHTML = (t) => escText(decodeEntities(t)).replace(/&lt;(\/?(?:strong|b|em|i|u)|br\s*\/?)&gt;/gi, "<$1>");
const plainOf = (t) => decodeEntities(String(t == null ? "" : t).replace(/<br\s*\/?>/gi, " ").replace(/<\/?(?:strong|b|em|i|u)>/gi, ""));

// ---- Tags (topics) ------------------------------------------------------------------------------------------------------------------------
// A story keeps its tags as one text, "tag one, tag two" (tags = Marathi, tags_en = English: shown in English when there are any, else the Marathi
// ones). A tag opens ?tag=<name>: every news / blog / review that carries it in either language, so the link keeps working after a language switch.
const splitTags = (t) => String(t == null ? "" : t).split(",").map((x) => x.trim()).filter(Boolean);
const tagKey = (t) => String(t).normalize("NFC").trim().toLowerCase();
const tagsOf = (a) => { const en = getLang() === "en" ? splitTags(a.tags_en) : []; return en.length ? en : splitTags(a.tags); };
const tagKeysOf = (a) => [...splitTags(a.tags), ...splitTags(a.tags_en)].map(tagKey);
const storiesWithTag = (tag) => articlesData.filter((a) => a.category !== "weekly" && tagKeysOf(a).includes(tagKey(tag)));
// "#भाजप" typed into a search box: that tag (as it is written in the stories), "" when no story has it
const tagSearched = (q) => {
  const typed = String(q || "").trim();
  if (!typed.startsWith("#")) return "";
  const wanted = tagKey(typed.slice(1));
  for (const a of articlesData) {
    const hit = [...splitTags(a.tags), ...splitTags(a.tags_en)].find((t) => tagKey(t) === wanted);
    if (hit) return hit;
  }
  return "";
};
const sharedTags = (a, b) => { const mine = tagKeysOf(a); return tagKeysOf(b).filter((t) => mine.includes(t)).length; };
const tagLinkHTML = (t) => `<span class="article-tag" data-no-i18n><a class="tag-link" href="${escText(pathForKey("tag-" + t))}" data-route="${escText("tag-" + t)}">#${escText(t)}</a></span>`;
const articleTagsHTML = (a) => {
  const list = tagsOf(a);
  return list.length ? `<div class="article-tags"><span class="article-tags-label"><i class="fa-solid fa-tags"></i> <span>टॅग</span>:</span>${list.map(tagLinkHTML).join("")}</div>` : "";
};
// English text of the content that is built into the site (js/content-en.js): the news by id, the weekly issues by number.
// It only FILLS what is empty - English typed in the Admin Panel (title_en ...) always wins.
const BUILT_IN_EN = (window.LOKMANGAL_CONTENT_EN && window.LOKMANGAL_CONTENT_EN.articles) || {};
const BUILT_IN_EN_WEEKLY = (window.LOKMANGAL_CONTENT_EN && window.LOKMANGAL_CONTENT_EN.weekly) || {};
function makeWeeklyArticle(item) {
  const desc = (WEEKLY_PDF ? item.desc : withoutPdfWords(item.desc)) || "";
  const builtIn = BUILT_IN_EN_WEEKLY[item.no] || {};
  const rawDescEn = item.descEn || builtIn.desc || "";
  const descEn = rawDescEn ? ((WEEKLY_PDF ? rawDescEn : withoutPdfWords(rawDescEn)) || "") : "";
  return {
    title_en: item.titleEn || builtIn.title || "",
    excerpt_en: descEn,
    content_en: descEn ? `<p>${inlineHTML(descEn)}</p>` : "",
    id: 1000 + item.no,
    issue: item.no,
    title: item.title,
    category: "weekly",
    categoryLabel: "साप्ताहिक आवृत्ती",
    author: "संपादकीय मंडळ",
    author_en: "Editorial Board",
    date: item.date,
    image: item.img,
    thumb: item.thumb || thumbOf(item.img),
    excerpt: desc,
    content: desc ? `<p>${inlineHTML(desc)}</p>` : "",
    views: item.views
  };
}

PAST_WEEKLY_ISSUES.forEach(item => articlesData.push(makeWeeklyArticle(item)));

// The built-in news get their English text (title_en, author_en, excerpt_en, content_en) from js/content-en.js. Called again after
// the backend's rows were merged in (syncPortalWithApi): a row that comes WITHOUT English must not wipe the built-in English.
function fillBuiltInEnglish() {
  articlesData.forEach((a) => {
    const en = a.category === "weekly" ? null : BUILT_IN_EN[a.id];
    if (!en) return;
    [["title_en", "title"], ["author_en", "author"], ["excerpt_en", "excerpt"], ["content_en", "content"]].forEach(([key, field]) => {
      if (!String(a[key] || "").trim() && en[field]) a[key] = en[field];
    });
  });
}
fillBuiltInEnglish();

// The most recently UPDATED news is listed first: a story that was edited in the Admin Panel, moved to another section or marked
// Popular / Random / Lead jumps to the top of Latest (Home), Popular, Random and its section. The backend stamps every
// change (updated_at). Stories with the same stamp - or none (built-in data / a static host without a backend) - keep their order,
// because Array.sort is stable.
const stampOf = (a) => String((a && a.updated_at) || "");
// Order of every list: a news / blog the owner gave a place number (Admin Panel, "क्रम क्रमांक") comes first, in number order; the rest follow, the most
// recently updated first. (Popular, Random, Latest, the sections and Blogs all use this.)
const placeOf = (a) => { const n = Number(a.sort_order); return Number.isFinite(n) && n > 0 ? n : null; };
const newerFirst = (a, b) => {
  const pa = placeOf(a), pb = placeOf(b);
  if (pa !== null || pb !== null) {
    if (pa === null) return 1;
    if (pb === null) return -1;
    if (pa !== pb) return pa - pb;
  }
  return stampOf(a) < stampOf(b) ? 1 : stampOf(a) > stampOf(b) ? -1 : 0;
};

// The views of a news / blog = the readers number typed in the Admin Panel ("वाचक संख्या", e.g. 34.8K) + the real clicks counted since
// (the backend counts every opening, see countRead). The website shows that sum wherever a story's views appear.
const clicksOf = (a) => Number(a.clicks) || 0;
const typedViews = (text) => {
  const m = /^(\d+(?:\.\d+)?)\s*([km])?/i.exec(devToAscii(String(text == null ? "" : text)).replace(/,/g, "").trim());
  return m ? Math.round(parseFloat(m[1]) * ({ k: 1e3, m: 1e6 }[(m[2] || "").toLowerCase()] || 1)) : 0;
};
const viewsOf = (a) => typedViews(a.views) + clicksOf(a);
// written like the typed text: the text itself until a click came in, then the sum in the same style (950, 1.2K, 34.8K, 1.2M)
const viewsText = (a) => {
  if (!clicksOf(a)) return a.views;
  const n = viewsOf(a);
  const short = (x, unit) => (Math.floor(x * 10) / 10).toFixed(1).replace(/\.0$/, "") + unit;
  return n >= 1e6 ? short(n / 1e6, "M") : n >= 1e3 ? short(n / 1e3, "K") : String(n);
};

// The Review section (रिव्ह्यू): first what the Admin Panel put there - a story of the रिव्ह्यू category, or one with the रिव्ह्यू box ticked
// (is_review) - in the usual order; then the news and blogs with the most views (equal views: the usual order), up to REVIEW_SHOWN in all.
const REVIEW_SECTIONS = ["rajkiy", "samajik", "blogs"];
const REVIEW_SHOWN = 10;
const chosenForReview = (a) => a.category === "review" || Number(a.is_review) === 1;
const reviewArticles = () => {
  const chosen = articlesData.filter((a) => a.category !== "weekly" && chosenForReview(a)).sort(newerFirst);
  const mostViewed = articlesData
    .filter((a) => REVIEW_SECTIONS.includes(a.category) && !chosenForReview(a))
    .sort((a, b) => viewsOf(b) - viewsOf(a) || newerFirst(a, b));
  return chosen.concat(mostViewed.slice(0, Math.max(0, REVIEW_SHOWN - chosen.length)));
};
// The stories of a section: the Review section's own list, every other section its own news / blogs
const sectionArticles = (cat) => (cat === "review" ? reviewArticles() : articlesData.filter((a) => a.category === cat));

// --- Weekly issues -----------------------------------------------------------------------------------
// Devanagari digits <-> plain numbers
const DEV_DIGITS = "०१२३४५६७८९";
const devToAscii = (s) => String(s).replace(/[०-९]/g, (d) => DEV_DIGITS.indexOf(d));
const toDevanagari = (n) => String(n).replace(/\d/g, (d) => DEV_DIGITS[d]);

articlesData.forEach((a) => {
  if (a.category !== "weekly" || a.issue) return;          // the weekly issues carry their number (makeWeeklyArticle)
  const m = String(a.title || "").match(/अंक\s*([०-९0-9]+)/);   // an old-style article of the weekly section: "... (अंक ४२)"
  a.issue = m ? parseInt(devToAscii(m[1]), 10) : null;
});

// The date of an issue as a sortable number (yyyymmdd), or null when it cannot be read.
// Reads "२६ ऑगस्ट २०२६", "26 August 2026", "26-08-2026" and "26/08/2026" (Marathi or ordinary digits).
const MARATHI_MONTHS = ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"];
const ENGLISH_MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
function dateValue(text) {
  const t = devToAscii(String(text || "")).trim().toLowerCase();
  let m = t.match(/(?:^|[^\d])(\d{4})\s*[-\/.]\s*(\d{1,2})\s*[-\/.]\s*(\d{1,2})(?!\d)/);   // 2026-08-26 (year, month, day)
  if (m) return Number(m[1]) * 10000 + Number(m[2]) * 100 + Number(m[3]);
  m = t.match(/(\d{1,2})\s*[-\/.]\s*(\d{1,2})\s*[-\/.]\s*(\d{4})/);          // 26-08-2026 (day, month, year)
  if (m) return Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]);
  m = t.match(/(\d{1,2})\s+([^\s\d,.]+)[.,]?\s+(\d{4})/);                          // 26 ऑगस्ट 2026 / 26 aug 2026
  if (!m) return null;
  let month = MARATHI_MONTHS.indexOf(m[2]);
  if (month < 0) month = ENGLISH_MONTHS.indexOf(m[2].slice(0, 3));
  return month < 0 ? null : Number(m[3]) * 10000 + (month + 1) * 100 + Number(m[1]);
}

// ---- "Published on: Nov 21, 2026, 14:05:07 IST": the small line under the headline of a news / blog (the place where Hindustan Times has it) ----
// The time is `published_at` ("YYYY-MM-DD HH:MM:SS", India time): the backend stamps it when a story is created, the Admin Panel can change it.
// A story written before that has only its date text: it shows the date and NO time (none is invented). Always India time, never the reader's clock.
// (backend/pubtime.py published_line() writes the same words for the page the server makes for crawlers.)
const ENGLISH_MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad2 = (n) => String(n).padStart(2, "0");
function publishedParts(a) {
  const m = String((a && a.published_at) || "").match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (m) return { y: +m[1], mo: +m[2], d: +m[3], time: `${m[4]}:${m[5]}:${m[6] || "00"}` };
  const day = dateValue((a && (a._mr_date || a.date)) || "");
  return day ? { y: Math.floor(day / 10000), mo: Math.floor(day / 100) % 100, d: day % 100, time: "" } : null;
}
function publishedLineHTML(a) {
  const p = publishedParts(a);
  if (!p || p.mo < 1 || p.mo > 12) return "";
  const text = getLang() === "en"
    ? `Published on: ${ENGLISH_MONTHS_SHORT[p.mo - 1]} ${p.d}, ${p.y}${p.time ? `, ${p.time} IST` : ""}`
    : `प्रकाशित: ${toDevanagari(p.d)} ${MARATHI_MONTHS[p.mo - 1]} ${toDevanagari(p.y)}${p.time ? `, ${toDevanagari(p.time)} IST` : ""}`;
  const stamp = `${p.y}-${pad2(p.mo)}-${pad2(p.d)}${p.time ? `T${p.time}+05:30` : ""}`;
  return `<div class="post-published" data-no-i18n><time datetime="${stamp}">${text}</time></div>`;
}

// Newest issue first: by DATE (an issue added later for an earlier week still lands in its place); equal / unreadable dates by number.
// An issue whose date cannot be read counts as the newest, so a freshly added issue never disappears at the bottom.
const weeklyIssues = () => articlesData.filter((a) => a.category === "weekly" && a.issue).sort((a, b) => {
  const da = dateValue(a.date), db = dateValue(b.date);
  return (db == null ? Infinity : db) - (da == null ? Infinity : da) || b.issue - a.issue;
});
const latestIssue = () => weeklyIssues()[0];
const issueByNo = (no) => articlesData.find((a) => a.category === "weekly" && a.issue === no);

// ---- PDF STORAGE -----------------------------------------------------------------------------------
// Every weekly issue has ONE pdf file, named  lokmangal-weekly-<issue number>.pdf  (e.g. lokmangal-weekly-42.pdf).
// PDF_BASE says where those files live:
//   • "assets/pdf/"  = inside this website. Works as it is; fine for a handful of files.
//   • 40+ issues of ~10 MB each are 400+ MB. Keep them OUTSIDE the website repo, in a storage bucket
//     (Cloudflare R2, Vercel Blob, Amazon S3 ...) and put the bucket's public address here, e.g.
//         const PDF_BASE = "https://pdf.lokmangal.com/weekly/";
//     The bucket must (1) allow CORS GET/HEAD from this site, (2) expose the response headers
//     Content-Length, Content-Range and Accept-Ranges, (3) support HTTP Range requests. See README -> "PDF storage".
// One article can also carry its own file:  pdf: "https://.../special-issue.pdf"
// (no PDF ships with the website: put the real files into assets/pdf/ with these names and set WEEKLY_PDF = true in js/config.js)
// js/config.js sets PDF_BASE (the S3 / CloudFront address of the pdf folder, e.g. "https://media.lokmangal.in/pdf/") on the live site; without it
// the files are read from this website's own assets/pdf/ folder.
const PDF_BASE = (() => {
  const base = String((window.LOKMANGAL_CONFIG && window.LOKMANGAL_CONFIG.PDF_BASE) || "assets/pdf/").trim();
  return /^(https:\/\/|assets\/)/.test(base) ? base.replace(/\/*$/, "/") : "assets/pdf/";
})();
const pdfFileName = (no) => `lokmangal-weekly-${no}.pdf`;
const pdfUrlFor = (a) => a.pdf || PDF_BASE + pdfFileName(a.issue);
const isSameOrigin = (u) => { try { return new URL(u, document.baseURI).origin === window.location.origin; } catch (e) { return true; } };
// A file on another domain (storage bucket) ignores the `download` attribute, so its links open in a NEW tab
// instead of replacing the website.
const pdfLinkAttrs = (url, no) => `href="${url}" download="Lokmangal-Weekly-${no}.pdf"${isSameOrigin(url) ? "" : ' target="_blank" rel="noopener"'}`;
const fmtSize = (b) => (b >= 1048576 ? `${toDevanagari((b / 1048576).toFixed(1))} MB` : `${toDevanagari(Math.max(1, Math.round(b / 1024)))} KB`);

// What do we know about a PDF file (size, does it exist)? One tiny HEAD request, remembered.
const pdfInfoCache = {};
function pdfInfo(url) {
  if (!pdfInfoCache[url]) {
    pdfInfoCache[url] = fetch(url, { method: "HEAD", cache: "no-cache" })
      .then((r) => ({
        ok: r.ok && !/text\/html/i.test(r.headers.get("content-type") || ""),   // some hosts answer a missing file with their HTML page
        bytes: Number(r.headers.get("content-length")) || 0,
      }))
      .catch(() => ({ ok: null, bytes: 0 }));                                    // null = could not find out (offline / blocked): hide nothing
  }
  return pdfInfoCache[url];
}

// Views that show PDF buttons mark the block with data-pdf-url: fill in the real file size, or say
// "coming soon" instead of leaving dead buttons when the file is not there yet.
async function hydratePdfBox(box) {
  const info = await pdfInfo(box.dataset.pdfUrl);
  if (!box.isConnected) return;
  if (info.ok === false) {
    box.querySelectorAll("[data-pdf-action]").forEach((el) => { el.hidden = true; });
    const note = box.querySelector(".pdf-missing-note");
    if (note) note.hidden = false;
  } else if (info.bytes) {
    box.querySelectorAll(".pdf-size").forEach((el) => { el.textContent = fmtSize(info.bytes); });
  }
}

function hydratePdfInfo(root) {
  (root || document).querySelectorAll("[data-pdf-url]:not([data-pdf-lazy])").forEach(hydratePdfBox);
}

// The long list of issues: ask about a file only when its row comes near the screen (not 42 requests at once)
function hydratePdfInfoLazily(root) {
  const boxes = (root || document).querySelectorAll("[data-pdf-url][data-pdf-lazy]");
  if (!("IntersectionObserver" in window)) { boxes.forEach(hydratePdfBox); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      hydratePdfBox(en.target);
    });
  }, { rootMargin: "400px 0px" });
  boxes.forEach((b) => io.observe(b));
}
const NEWS_CATEGORIES = ["samajik", "rajkiy"];   // the "News" menu = Samajik + Rajkiy

// Search understands both digit styles: "२५" and "25" find the same thing
const searchKey = (s) => devToAscii(String(s == null ? "" : s).toLowerCase());
// The first news item whose headline / text has the words; otherwise the NEWEST weekly issue that matches
// (by headline, short text or date: "२४ सप्टेंबर २०२५", "24 सप्टेंबर 2025").
function findArticleByQuery(q) {
  const k = searchKey(q).trim().replace(/^#/, "");
  const hit = (a) => searchKey([a.title, a._mr_title, a.title_en, plainOf(a.excerpt), plainOf(a._mr_excerpt), plainOf(a.excerpt_en), a.tags, a.tags_en].filter(Boolean).join(" ")).includes(k)
    || (a.category === "weekly" && searchKey(a.date + " " + (a._mr_date || "")).includes(k));
  return articlesData.find((a) => a.category !== "weekly" && hit(a)) || weeklyIssues().find(hit);
}

// Current State (the router below sets these for every view)
let currentCategory = "all";
let mainStoryId = 1;   // default to top breaking news (Post 1: Subhash Bapu Deshmukh)

// --- Image helpers: ask the image CDN for the size a slot really needs (saves a lot of mobile data) ---
const LAZY_IMG = 'loading="lazy" decoding="async"';
const HERO_IMG_ATTRS = 'decoding="async" fetchpriority="high"';

// Unsplash URLs carry a width parameter (w=800). Swap in the width we need; other URLs pass through untouched.
function imgW(url, w) {
  return /[?&]w=\d+/.test(url) ? url.replace(/([?&])w=\d+/, `$1w=${w}`) : url;
}

// Small thumbnail (list rows, grids): fixed width, lazy loaded
function thumbImg(url, alt, w) {
  return `<img src="${imgW(url, w)}" alt="${altText(alt)}" ${LAZY_IMG} />`;
}

// (a headline with a " in it must not end the alt="..." attribute)
const altText = (alt) => String(alt == null ? "" : alt).replace(/"/g, "&quot;");

// Large image with srcset, so phones fetch ~480px and big screens the bigger file
function fluidImg(url, alt, widths, sizes, attrs = LAZY_IMG) {
  if (!/[?&]w=\d+/.test(url)) return `<img src="${url}" alt="${altText(alt)}" ${attrs} />`;
  const mid = widths[Math.floor(widths.length / 2)];
  const srcset = widths.map(w => `${imgW(url, w)} ${w}w`).join(", ");
  return `<img src="${imgW(url, mid)}" srcset="${srcset}" sizes="${sizes}" alt="${altText(alt)}" ${attrs} />`;
}

// The large card (Popular, Videos, the slide-out menu, the Home news list): the photo on top and ALL the text BELOW
// it - a headline, label or date never sits on a photo. `mediaExtra` is for icons only (the play button of a video).
// the title of a story as a real link (crawlers follow it, "open in a new tab" works); a plain click is taken over by the listener in the router
const titleLink = (a, text = a.title) => `<a class="title-link" ${linkTo(a)}>${text}</a>`;

function largeCardHTML({ cls = "", onclick, imgHTML, mediaExtra = "", badge = "", title, titleTag = "h4", byline = "", link = "" }) {
  return `
    <div class="popular-card-large${cls ? " " + cls : ""}" onclick="${onclick}">
      <div class="popular-card-media">
        ${imgHTML}${mediaExtra}
      </div>
      <div class="popular-card-caption">
        ${badge}
        <${titleTag} class="popular-card-title">${link ? `<a class="title-link" ${link}>${title}</a>` : title}</${titleTag}>
        <div class="popular-card-byline">${byline}</div>
      </div>
    </div>`;
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

// ---- Language of the DATA (news titles, texts, authors, dates) ----------------------------------------------------------
// js/i18n.js translates the interface. A news item / issue also has its own English text (title_en, excerpt_en, content_en,
// author_en: typed in the Admin Panel's English tab). While English is chosen the page data shows it, and falls back to the
// Marathi text when there is none. The Marathi originals stay in _mr_<field>, so switching back (or a fresh answer of the
// backend) is exact.
const LANG_FIELDS = ["title", "excerpt", "content", "author", "date", "categoryLabel"];
const CATEGORY_LABELS_MR = { rajkiy: "राजकीय", samajik: "सामाजिक", blogs: "ब्लॉग्स", review: "रिव्ह्यू", reviews: "रिव्ह्यू", weekly: "साप्ताहिक आवृत्ती" };

function restoreRawFields(a, forget) {
  LANG_FIELDS.forEach((f) => {
    const key = "_mr_" + f;
    if (a[key] !== undefined) {
      a[f] = a[key];
      if (forget) delete a[key];
    }
  });
}

function applyDataLanguage() {
  const en = getLang() === "en";
  articlesData.forEach((a) => {
    restoreRawFields(a);
    LANG_FIELDS.forEach((f) => { a["_mr_" + f] = a[f]; });
    if (en) {
      ["title", "excerpt", "content", "author"].forEach((f) => {
        const v = a[f + "_en"];
        if (v && String(v).trim()) a[f] = v;
      });
    }
    a.categoryLabel = trUI(CATEGORY_LABELS_MR[a.category] || a._mr_categoryLabel || "");
    a.date = localizeDates(a._mr_date || "");
  });
}

// js/i18n.js calls this after the language was switched: everything that is drawn from data is drawn again
window.onLanguageChange = function () {
  applyDataLanguage();
  renderLabelCounts();
  renderLeftSidebar();
  renderRightSidebar();
  renderFeaturedVideos();
  updateAdLanguage();
  renderFooterContact();
  if (drawerPopularRendered && typeof renderDrawerPopularItems === "function") renderDrawerPopularItems();
  if (typeof renderRoute === "function") renderRoute({ scroll: false });
};

// Initialize on Load
document.addEventListener("DOMContentLoaded", () => {
  loadStaticArticles();
  renderFooterContact();
  applyDataLanguage();
  initThemeToggle();
  prettifyMenuLinks();
  initNavigation();
  initSearch();
  initDrawerSearch();
  initDrawerSwipe();
  initSheetSwipe();
  initCommentEvents();
  renderLabelCounts();
  renderLeftSidebar();
  renderRightSidebar();
  renderFeaturedVideos();
  // (the slide-out "Popular Items" list is rendered the first time the menu opens - see openDrawer)

  initRouter();   // draws the view that matches the address (Home when there is no #hash)
  openVideoFromAddress();                               // (/video/<words>: that video, if the page already knows it)
  initBackToTop();
  initSmartHeader();
  initAdSlider();
});

// "Responsive Ads" widget: the ads the owner uploads in the Admin Panel (Advertisements) - a photo or a video each - are shown one after the
// other, then it starts again. A photo stays AD_SLIDE_MS; a video plays (muted, it is an ad) for its own length, at most AD_VIDEO_MAX_MS.
// The clock runs only while the widget is on the screen, the tab is open and the ad that is showing has loaded, so a
// visitor who scrolls down to it always sees the first ad for its full time (and nothing runs for nobody).
const AD_SLIDE_MS = 4000;

// A site that has its OWN backend (API_BASE is set: the live site) takes everything from the API. The data files js/articles-data.js, videos-data.js,
// ads-data.js and settings-data.js are a snapshot the backend keeps for a static host WITHOUT a backend (Vercel); on the live site they must never
// show - they hold the content of the PC they were written on.
const staticDataAllowed = !(window.LOKMANGAL_CONFIG && window.LOKMANGAL_CONFIG.API_BASE);
const AD_VIDEO_MAX_MS = 30000;

// The ads where nothing else is known (no ads-data.js, no backend): the three the website always had. Normally the list is js/ads-data.js
// (kept by the backend, for a static host) and then GET /api/ads - an EMPTY list from either means "no ads", not "the old three".
const builtInAds = [
  { id: 1, media_type: "image", title: "लोकमंगल पतसंस्था — सोने खरेदी कर्ज", title_en: "Lokmangal Patsanstha — gold purchase loan", media_url: "assets/ad-1.jpg" },
  { id: 2, media_type: "image", title: "लोकमंगल बँक — दसरा दिवाळी, नवी सुरुवात", title_en: "Lokmangal Bank — Dasara Diwali, a new beginning", media_url: "assets/ad-2.jpg" },
  { id: 3, media_type: "image", title: "लोकमंगल फाउंडेशन — अन्नपूर्णा योजना", title_en: "Lokmangal Foundation — Annapurna Yojana", media_url: "assets/ad-3.jpg" },
];
let adsData = staticDataAllowed && Array.isArray(window.ADS_DATA) ? window.ADS_DATA : builtInAds;
const adSlider = { box: null, at: 0, timer: null, onScreen: true, sig: "", shown: [] };

// only a file of this site or an http(s) address is ever put into the page
const safeAdUrl = (u) => { const s = String(u || "").trim(); return /^(assets\/[\w.\-\/]+|https?:\/\/\S+)$/i.test(s) ? s : ""; };
const adTitle = (a) => (getLang() === "en" && a.title_en && String(a.title_en).trim() ? a.title_en : a.title) || "";

function renderAds() {
  const box = adSlider.box || document.getElementById("ad-slider");
  if (!box) return;
  adSlider.box = box;
  const sig = JSON.stringify(adsData.map((a) => [a.id, a.media_type, a.media_url, a.thumbnail, a.link_url, a.duration_sec]));
  if (sig === adSlider.sig && box.children.length) { updateAdLanguage(); return; }      // nothing changed: the ad on show is not restarted
  adSlider.sig = sig;
  clearTimeout(adSlider.timer);
  adSlider.timer = null;
  const ads = adsData.filter((a) => safeAdUrl(a.media_url));
  if (!ads.length) {
    adSlider.shown = [];
    box.innerHTML = `<div class="ad-empty"><i class="fa-regular fa-image"></i><span>${escText(trUI("जाहिरात"))}</span></div>`;
    return;
  }
  box.innerHTML = ads.map((a, i) => {
    const url = escText(safeAdUrl(a.media_url));
    const poster = escText(safeAdUrl(a.thumbnail));
    const link = /^https?:\/\/\S+$/i.test(String(a.link_url || "").trim()) ? escText(String(a.link_url).trim()) : "";
    const title = escText(adTitle(a));
    const media = a.media_type === "video"
      ? `${poster ? `<img class="ad-bg" src="${poster}" alt="" aria-hidden="true" decoding="async" />` : ""}
         <video class="ad-img ad-video" src="${url}" ${poster ? `poster="${poster}"` : ""} muted loop playsinline preload="metadata" aria-label="${title}"></video>`
      : `<img class="ad-bg" src="${url}" alt="" aria-hidden="true" loading="lazy" decoding="async" />
         <img class="ad-img" src="${url}" alt="${title}" loading="lazy" decoding="async" />`;
    const attrs = `class="ad-slide" data-ad="${i}"${a.duration_sec ? ` data-sec="${Number(a.duration_sec) || 0}"` : ""}`;
    return link
      ? `<a ${attrs} href="${link}" target="_blank" rel="noopener noreferrer sponsored">${media}</a>`
      : `<div ${attrs}>${media}</div>`;
  }).join("");
  adSlider.shown = ads;
  adSlides().forEach((slide) => {               // the ad on show finished loading late: the clock starts now
    const media = slide.querySelector(".ad-img");
    media.addEventListener(media.tagName === "VIDEO" ? "loadeddata" : "load", () => { if (adSlides()[adSlider.at] === slide) adSync(); });
  });
  adShow(0);
}

// the language was switched: the text of the pictures (alt) follows, nothing is restarted
function updateAdLanguage() {
  const ads = adSlider.shown || [];
  adSlides().forEach((slide, i) => {
    const title = ads[i] ? adTitle(ads[i]) : "";
    const media = slide.querySelector(".ad-img");
    if (media) media.setAttribute(media.tagName === "VIDEO" ? "aria-label" : "alt", title);
  });
  const empty = adSlider.box && adSlider.box.querySelector(".ad-empty span");
  if (empty) empty.textContent = trUI("जाहिरात");
}

const adSlides = () => (adSlider.box ? [...adSlider.box.querySelectorAll(".ad-slide")] : []);

// the ad has loaded (a photo is complete, a video has its first picture; a broken one counts: the show goes on)
function adReady(slide) {
  const media = slide.querySelector(".ad-img");
  if (!media) return true;
  return media.tagName === "VIDEO" ? media.readyState >= 2 || !!media.error : media.complete;
}

// how long the ad stays: a photo AD_SLIDE_MS, a video its own length (at least a photo's time, at most AD_VIDEO_MAX_MS)
function adDelay(slide) {
  const video = slide.querySelector("video");
  if (!video) return AD_SLIDE_MS;
  const sec = Number(slide.dataset.sec) || video.duration;
  return sec && isFinite(sec) ? Math.min(AD_VIDEO_MAX_MS, Math.max(AD_SLIDE_MS, Math.round(sec * 1000))) : 10000;
}

// slide n is the one on show (a video before it stops, a video that comes on starts from its beginning)
function adShow(n) {
  const slides = adSlides();
  if (!slides.length) return;
  slides.forEach((slide, i) => {
    const on = i === n;
    slide.classList.toggle("active", on);
    if (on) slide.removeAttribute("aria-hidden"); else slide.setAttribute("aria-hidden", "true");
    const video = slide.querySelector("video");
    if (video && !on) video.pause();
    if (video && on) { try { video.currentTime = 0; } catch (e) { /* not loaded yet: it starts at 0 anyway */ } }
  });
  adSlider.at = n;
  adSync();
}

// (re)start what belongs to the ad on show: its video, and the clock for the next ad - only while the widget is seen
function adSync() {
  clearTimeout(adSlider.timer);
  adSlider.timer = null;
  const slides = adSlides();
  const slide = slides[adSlider.at];
  if (!slide) return;
  const seen = adSlider.onScreen && !document.hidden;
  const video = slide.querySelector("video");
  if (video) { if (seen) video.play().catch(() => { /* the browser refused to autoplay: the poster stays */ }); else video.pause(); }
  if (slides.length < 2 || !seen || !adReady(slide)) return;
  adSlider.timer = setTimeout(() => adShow((adSlider.at + 1) % slides.length), adDelay(slide));
}

function initAdSlider() {
  const box = document.getElementById("ad-slider");
  if (!box) return;
  adSlider.box = box;
  adSlider.onScreen = !("IntersectionObserver" in window);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      adSlider.onScreen = entries[entries.length - 1].isIntersecting;
      adSync();
    }, { threshold: 0.25 }).observe(box);
  }
  document.addEventListener("visibilitychange", adSync);
  renderAds();
}

// "सर्व बातम्या (१६)"-style counters in the Labels widget come from the data, not from typed numbers
function renderLabelCounts() {
  const count = (cat) => (cat === "all" ? articlesData.filter((a) => a.category !== "weekly").length : sectionArticles(cat).length);
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

// The menus are written in index.html with the old ?cat= addresses (they work on any host). Where the pretty addresses are on, their links carry the
// pretty ones instead (/rajkiy, /blog, /weekly ...): what a crawler follows, and what "open in a new tab" opens. A plain click is still taken over
// by the router (data-route).
function prettifyMenuLinks() {
  if (!prettyUrlsOn()) return;
  document.querySelectorAll("a[data-route]").forEach((a) => {
    const route = a.getAttribute("data-route");
    if (/^(weekly|cat-(rajkiy|samajik|blogs|review))$/.test(route)) a.setAttribute("href", pathForKey(route));
  });
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

  // Footer quick links (the same buttons as the header)
  document.querySelectorAll(".footer-quick-link").forEach(btn => {
    const on = btn.dataset.cat === category;
    btn.classList.toggle("active", on);
    if (on) btn.setAttribute("aria-current", "true");
    else btn.removeAttribute("aria-current");
  });

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

function getMarathiCategory(cat) {            // Marathi only: js/i18n.js shows the English name when English is chosen
  switch(cat) {
    case "rajkiy": return "राजकीय";
    case "samajik": return "सामाजिक";
    case "weekly": return "साप्ताहिक आवृत्ती";
    case "blogs": return "ब्लॉग्स";
    case "review": return "रिव्ह्यू";
    default: return "होम";
  }
}

// --- Render Left Sidebar (Popular Posts matching Xapify) ---
// "अधिक वाचा" under the Popular / Random widgets and the Blogs list: the first POPULAR_SHOWN / RANDOM_SHOWN / BLOGS_SHOWN stories are shown,
// the rest (a newly added story pushes the oldest one down, it never disappears) opens with the button and closes again with "कमी दाखवा".
const POPULAR_SHOWN = 4, RANDOM_SHOWN = 4, BLOGS_SHOWN = 5;
let popularExpanded = false, randomExpanded = false, blogsExpanded = false;

function moreButtonHTML(kind, total, limit, expanded) {
  if (total <= limit) return "";
  return `
    <div class="load-more-wrap video-more-wrap">
      <button type="button" class="btn-load-more" aria-expanded="${expanded}" onclick="toggleMoreStories('${kind}')">
        <i class="fa-solid fa-angles-${expanded ? "up" : "down"}"></i>
        <span>${expanded ? "कमी दाखवा" : "अधिक वाचा"}</span>
      </button>
    </div>`;
}

window.toggleMoreStories = function(kind) {
  if (kind === "popular") { popularExpanded = !popularExpanded; renderLeftSidebar(); }
  else if (kind === "random") { randomExpanded = !randomExpanded; renderRightSidebar(); }
  else if (kind === "blogs") { blogsExpanded = !blogsExpanded; renderSecondaryPosts(); }
};

// The order inside the Popular / Random widgets: their own place numbers (popular_order / random_order: a story put in is number 1, the
// Admin Panel can move it), then any story without one in the usual order of the lists.
const placementOrder = (field) => (a, b) => {
  const pa = Number(a[field]) || 0, pb = Number(b[field]) || 0;
  if (pa && pb && pa !== pb) return pa - pb;
  if (pa !== pb) return pa ? -1 : 1;
  return newerFirst(a, b) || b.id - a.id;
};

function renderLeftSidebar() {
  const container = document.getElementById("popular-posts-container");
  if (!container) return;

  // Pick articles explicitly marked as popular in Admin Panel, in their Popular places (placementOrder); the widget shows POPULAR_SHOWN,
  // the rest waits behind "अधिक वाचा"
  let popularList = articlesData.filter(a => Number(a.is_popular) === 1 && a.category !== "weekly").sort(placementOrder("popular_order"));
  
  // Only what is marked Popular in the Admin Panel is listed: nothing is added to fill the places (a story taken out of Popular must be gone)
  const total = popularList.length;
  const shown = popularExpanded ? popularList : popularList.slice(0, POPULAR_SHOWN);
  if (!shown.length) {
    container.innerHTML = `<p class="empty-note">अजून कोणतीही बातमी लोकप्रिय केलेली नाही.</p>`;
    return;
  }
  const item0 = shown[0];

  container.innerHTML = `
    <!-- Item 0 Large Card: photo, then the text below it -->
    ${largeCardHTML({
      onclick: `openArticlePage(${item0.id})`,
      link: linkTo(item0),
      imgHTML: fluidImg(item0.image, item0.title, [480, 800], "(max-width: 600px) 100vw, 300px"),
      badge: `<span class="category-tag-badge cat-${item0.category}">${item0.categoryLabel}</span>`,
      title: item0.title,
      byline: `<span class="by-word">by </span>${item0.author} - ${item0.date}`,
    })}

    <!-- The other list cards -->
    ${shown.slice(1).map((item) => `
    <div class="popular-sub-item" onclick="openArticlePage(${item.id})">
      <div class="popular-sub-thumb">
        ${thumbImg(item.image, item.title, 240)}
      </div>
      <div class="popular-sub-content">
        <h5 class="popular-sub-title">${titleLink(item)}</h5>
        <span class="popular-sub-date">${item.date}</span>
      </div>
    </div>`).join("")}
    ${moreButtonHTML("popular", total, POPULAR_SHOWN, popularExpanded)}
  `;
}

// --- Render Right Sidebar (Random Posts 2x2 Grid matching screenshot) ---
function renderRightSidebar() {
  const container = document.getElementById("random-posts-grid");
  if (!container) return;

  // Pick articles explicitly marked as random in Admin Panel, in their Random places; RANDOM_SHOWN are shown, the rest waits behind "अधिक वाचा"
  let randomList = articlesData.filter(a => Number(a.is_random) === 1 && a.category !== "weekly").sort(placementOrder("random_order"));

  // Only what is marked Random in the Admin Panel is listed: nothing is added to fill the places
  const total = randomList.length;
  if (!total) {
    container.innerHTML = `<p class="empty-note" style="grid-column: 1 / -1">अजून कोणतीही बातमी यादृच्छिक केलेली नाही.</p>`;
    return;
  }

  container.innerHTML = (randomExpanded ? randomList : randomList.slice(0, RANDOM_SHOWN)).map(item => `
    <div class="random-grid-item" onclick="openArticlePage(${item.id})">
      <div class="random-grid-thumb">
        ${thumbImg(item.image, item.title, 400)}
      </div>
      <h5 class="random-grid-title">${titleLink(item)}</h5>
      <span class="random-grid-date">${item.date}</span>
    </div>
  `).join("") + moreButtonHTML("random", total, RANDOM_SHOWN, randomExpanded);
}

// --- Videos of the Featured Videos widget: only what the owner uploads / links in the Admin Panel (see videoPostsData below) ---
const builtInVideos = [];   // (the old sample videos were removed: with no uploaded video the widget shows its empty card)

// The videos the widget shows: the sample videos above until the owner uploads one (Admin Panel > Videos), then HIS uploads, newest
// first. A sample video only pretends to play; an uploaded video has `src` - the real file - and is played by the browser's own player.
let videoPostsData = builtInVideos;

const VIDEO_PLACEHOLDER = "assets/images/video-placeholder.svg";   // the picture of a video that has none (a dark box, the play button is drawn on it)

// the 11-character id of a YouTube link (watch?v=, youtu.be/, /embed/, /shorts/, /live/), or "" for any other address
function youtubeIdOf(url) {
  const m = /^https?:\/\/(?:www\.|m\.|music\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#\s]*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})(?![\w-])/i.exec(String(url || "").trim());
  return m ? m[1] : "";
}

// one row of GET /api/videos -> the shape of the sample videos (the text stays raw: videoView() picks the language and makes it safe).
// `video_url` is a file this server saved, a YouTube link (played in YouTube's own player) or the direct link of a video file.
function videoFromRow(row) {
  const yt = youtubeIdOf(row.video_url);
  return {
    id: "u" + row.id,
    uploaded: true,
    yt,
    slug: row.slug || "",
    src: row.video_url,
    title: row.title,
    title_en: row.title_en,
    description: row.description || "",
    description_en: row.description_en || "",
    duration_sec: row.duration_sec,
    created_at: row.created_at,
    thumbnail: row.thumbnail || (yt ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg` : VIDEO_PLACEHOLDER),
  };
}

// Where there is no backend (a static host) the videos come from js/videos-data.js, which the backend keeps in step with the Admin Panel;
// with a backend the website asks /api/videos and that answer replaces this (see syncPortalWithApi).
videoPostsData = (staticDataAllowed && Array.isArray(window.VIDEOS_DATA) ? window.VIDEOS_DATA : []).map(videoFromRow);

// "०६:१५" (Marathi) / "06:15" (English); "" when the length is not known
function videoLengthText(sec) {
  const n = Number(sec);
  if (sec === null || sec === undefined || sec === "" || !isFinite(n) || n <= 0) return "";
  const s = Math.round(n);
  const two = (x) => String(x).padStart(2, "0");
  const h = Math.floor(s / 3600);
  const text = h ? `${h}:${two(Math.floor((s % 3600) / 60))}:${two(s % 60)}` : `${two(Math.floor(s / 60))}:${two(s % 60)}`;
  return getLang() === "en" ? text : toDevanagari(text);
}

// the day of the upload, in the language of the page (the database keeps UTC; the visitor sees his own day)
function videoDateText(createdAt) {
  const d = createdAt ? new Date(String(createdAt).replace(" ", "T") + "Z") : null;
  if (!d || isNaN(d.getTime())) return "";
  return localizeDates(`${toDevanagari(d.getDate())} ${MARATHI_MONTHS[d.getMonth()]} ${toDevanagari(d.getFullYear())}`);
}

// A video as the page shows it right now: the language chosen (title_en / description_en when English is on), its length and date, and
// every text made safe for HTML (a title may contain " or <). The sample videos are Marathi text that js/i18n.js translates after drawing.
function videoView(v) {
  if (!v.uploaded) return { ...v, title: escText(v.title), description: inlineHTML(v.description) };
  const en = getLang() === "en";
  const text = (mr, enText) => escText(en && enText && String(enText).trim() ? enText : mr);
  return {
    ...v,
    title: text(v.title, v.title_en),
    description: inlineHTML(en && v.description_en && plainOf(v.description_en).trim() ? v.description_en : v.description),
    duration: videoLengthText(v.duration_sec),
    date: videoDateText(v.created_at),
    categoryLabel: "व्हिडिओ",
    views: "",                                    // nothing counts the viewers of an uploaded video: no made-up number
    thumbnail: escText(v.thumbnail),
    src: escText(v.src),
  };
}

// "length • views • date" - the parts that exist
function videoMetaParts(v) {
  return [
    v.duration ? `<i class="fa-solid fa-video"></i> ${v.duration}` : "",
    v.views ? `<i class="fa-solid fa-eye"></i> ${v.views}` : "",
    v.date,
  ].filter(Boolean);
}

function videoRowHTML(v) {
  return `
    <div class="popular-sub-item video-sub-item" onclick="openVideoModal('${v.id}')">
      <div class="popular-sub-thumb video-sub-thumb">
        ${thumbImg(v.thumbnail, v.title, 240)}
        <div class="video-mini-play-overlay">
          <i class="fa-solid fa-play"></i>
        </div>
      </div>
      <div class="popular-sub-content">
        <h5 class="popular-sub-title">${v.title}</h5>
        <div class="popular-sub-date">
          ${videoMetaParts(v).map((part, i) => `<span>${i ? "• " : ""}${part}</span>`).join("\n          ")}
        </div>
      </div>
    </div>`;
}

// --- Render Featured Videos: the newest video as a large card, the 3 before it as rows, the rest after "अधिक पहा" ---
const VIDEO_ROWS_SHOWN = 3;
function renderFeaturedVideos() {
  const container = document.getElementById("featured-videos-container");
  if (!container) return;

  const [first, ...rest] = videoPostsData.map(videoView);
  if (!first) {                                  // nothing uploaded (or all deleted): the section stays, with a note
    container.innerHTML = `<div class="video-empty"><i class="fa-solid fa-film"></i><p>सध्या एकही व्हिडिओ उपलब्ध नाही</p></div>`;
    return;
  }
  const shown = rest.slice(0, VIDEO_ROWS_SHOWN);
  const more = rest.slice(VIDEO_ROWS_SHOWN);

  container.innerHTML = `
    <!-- Large Featured Video Card: thumbnail with the play icon, the text (and the length) below it -->
    ${largeCardHTML({
      cls: "video-card-large",
      onclick: `openVideoModal('${first.id}')`,
      imgHTML: fluidImg(first.thumbnail, first.title, [480, 800], "(max-width: 600px) 100vw, 300px"),
      mediaExtra: `<div class="video-play-center-btn" title="व्हिडिओ पाहा"><i class="fa-solid fa-play"></i></div>`,
      badge: `<span class="category-tag-badge video-badge">${first.categoryLabel}</span>`,
      title: first.title,
      byline: videoMetaParts(first).join(" • "),
    })}

    <!-- List Video Items (the 3 before it) -->
    ${shown.map(videoRowHTML).join("")}
    ${more.length ? `
    <div class="video-more-rows" hidden>${more.map(videoRowHTML).join("")}</div>
    <div class="load-more-wrap video-more-wrap">
      <button type="button" class="btn-load-more" onclick="showMoreVideos(this)">
        <i class="fa-solid fa-angles-down"></i>
        <span>अधिक पहा</span>
      </button>
    </div>` : ""}
  `;
}

// "अधिक पहा": the rest of the videos appear
window.showMoreVideos = function(btn) {
  const box = btn.closest("#featured-videos-container");
  if (!box) return;
  const rows = box.querySelector(".video-more-rows");
  if (rows) rows.hidden = false;
  const wrap = btn.closest(".video-more-wrap");
  if (wrap) wrap.remove();
};

// The video must not keep playing (or downloading) behind a closed window: the player is taken out of the page.
function stopVideoPlayer() {
  const body = document.getElementById("video-modal-body");
  if (!body) return;
  body.querySelectorAll("video").forEach((el) => {
    el.pause();
    el.removeAttribute("src");
    el.load();
  });
  body.innerHTML = "";
}

window.copyVideoLink = function(btn) {
  navigator.clipboard?.writeText(btn.dataset.url || window.location.href);
  showToast("व्हिडिओ लिंक कॉपी केली!");
};

// A video's own address, /video/<words>: Home with that video open. The address bar shows it while the video is open, and it is what the Share
// button copies (where there are no pretty addresses, or for a video without words yet, the address of the video file as before).
const videoSlugInPath = () => {
  const m = /^\/video\/([^/]+)\/?$/.exec(window.location.pathname);
  try { return m ? decodeURIComponent(m[1]) : ""; } catch (e) { return ""; }
};
const videoPagePath = (v) => (v.slug && prettyUrlsOn() ? "/video/" + encodeURIComponent(v.slug) + (getLang() === "en" ? "?lang=en" : "") : "");
const videoShareUrl = (v) => (videoPagePath(v) ? window.location.origin + videoPagePath(v) : new URL(v.src, document.baseURI).href);
let videoOnShow = null;                // { before, title, landed } while a video is open (see leaveVideoAddress)
let videoAddressDone = false;          // the video of the address the page was opened with has been shown (or there is none)

// The page was opened with a video's address: open that video as soon as the list that has it is there.
function openVideoFromAddress() {
  if (videoAddressDone) return;
  const slug = videoSlugInPath();
  const video = slug ? videoPostsData.find((v) => v.slug === slug) : null;
  if (!slug || video) videoAddressDone = true;
  if (video) openVideoModal(video.id);
}

// The video is open: the address bar shows its address and the tab its title.
function showVideoAddress(video) {
  const landed = !!videoSlugInPath();                  // (the page was opened with a video's address)
  const before = document.title;
  const path = videoPagePath(video);
  if (path) { try { history.replaceState(history.state, "", path); } catch (e) { /* ignore */ } }
  setDocTitle((getLang() === "en" && video.title_en) || video.title);
  videoOnShow = { before, title: document.title, landed };
}

// The video is closed: the address bar and the tab show the page under it again.
function leaveVideoAddress() {
  const shown = videoOnShow;
  videoOnShow = null;
  if (!shown) return;
  whenHistorySettled(() => {                           // (a phone first goes one step back in the history)
    if (videoSlugInPath()) replaceUrl(renderedRoute);
    if (shown.landed) renderRoute({ scroll: false });  // opened by its address: Home gets its own title and tags
    else if (document.title === shown.title) document.title = shown.before;
  });
}

// --- Video Player Modal Opener ---
window.openVideoModal = function(videoId) {
  const raw = videoPostsData.find(v => v.id === videoId);
  if (!raw) return;
  videoAddressDone = true;
  const video = videoView(raw);

  const modal = document.getElementById("video-player-modal");
  const body = document.getElementById("video-modal-body");
  if (!modal || !body) return;

  // an uploaded video: the real player (play / pause, seeking, volume, full screen); a sample video: the poster with a pulsing icon
  const screen = video.yt
    ? `<div class="video-player-screen video-player-yt">
        <iframe src="https://www.youtube-nocookie.com/embed/${video.yt}?autoplay=1&rel=0&playsinline=1" title="${video.title}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
      </div>`
    : video.uploaded
    ? `<div class="video-player-screen video-player-real">
        <video class="video-player-el" controls autoplay playsinline preload="metadata" poster="${video.thumbnail}" src="${video.src}"></video>
        <div class="video-player-error" hidden>
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>हा व्हिडिओ चालू होऊ शकला नाही.</span>
          <a class="btn-read-full" href="${video.src}" target="_blank" rel="noopener">व्हिडिओ फाईल उघडा</a>
        </div>
      </div>`
    : `<div class="video-player-screen">
        ${fluidImg(video.thumbnail, video.title, [640, 800], "(max-width: 760px) 100vw, 720px", 'class="video-poster-img" decoding="async"')}
        <div class="video-playing-overlay">
          <div class="video-playing-pulse" onclick="showToast('व्हिडिओ प्लेबॅक सक्रिय')">
            <i class="fa-solid fa-circle-play"></i>
          </div>
        </div>
      </div>`;
  const lengthLine = video.uploaded
    ? (video.duration ? `<i class="fa-solid fa-video"></i> ${video.duration}` : "")
    : `<i class="fa-solid fa-video"></i> HD व्हिडिओ स्ट्रीम उपलब्ध (${video.duration})`;
  const whenLine = video.uploaded
    ? `<i class="fa-regular fa-clock"></i> ${video.date}`
    : `<i class="fa-solid fa-eye"></i> ${video.views} • <i class="fa-regular fa-clock"></i> ${video.date}`;
  const buttons = video.uploaded
    ? `<button class="btn-listen-audio" data-url="${escText(videoShareUrl(raw))}" onclick="copyVideoLink(this)">
            <i class="fa-solid fa-share-nodes"></i> शेअर करा
          </button>`
    : `<button class="btn-read-full" onclick="showToast('व्हिडिओ प्लेलिस्टमध्ये सेव्ह केला')">
            <i class="fa-regular fa-bookmark"></i> नंतर पाहा
          </button>
          <button class="btn-listen-audio" onclick="navigator.clipboard?.writeText(window.location.href); showToast('व्हिडिओ लिंक कॉपी केली!')">
            <i class="fa-solid fa-share-nodes"></i> शेअर करा
          </button>`;

  body.innerHTML = `
    <div class="video-player-wrapper">
      ${screen}
      <div class="video-details-pad">
        ${lengthLine ? `<p style="font-size:13px; font-weight:600; color:var(--meta-color); margin:0 0 10px">${lengthLine}</p>` : ""}
        <div class="video-meta-row">
          <span class="category-tag-badge video-badge" style="position:static">${video.categoryLabel}</span>
          <span style="font-size:12px; color:var(--meta-color)">
            ${whenLine}
          </span>
        </div>
        <h3 style="font-size:18px; font-weight:700; color:var(--title-color); margin:10px 0 8px; line-height:1.4">
          ${video.title}
        </h3>
        ${video.description ? `<p style="font-size:13.5px; color:var(--text-color); line-height:1.6; margin-bottom:14px">${video.description}</p>` : ""}
        <div style="display:flex; gap:10px; flex-wrap:wrap">
          ${buttons}
        </div>
      </div>
    </div>
  `;

  showModal(modal);
  showVideoAddress(raw);

  const player = body.querySelector("video.video-player-el");
  if (player) {
    player.addEventListener("error", () => {
      const box = body.querySelector(".video-player-error");
      if (box) box.hidden = false;
    });
    const started = player.play();            // (autoplay is also set; a browser that refuses leaves the play button of the controls)
    if (started && started.catch) started.catch(() => {});
  }
};

// --- Render Popular Items inside Slide-Out Drawer (Matching Image 2) ---
function renderDrawerPopularItems() {
  const container = document.getElementById("drawer-popular-list");
  if (!container) return;

  let popularList = articlesData.filter(a => Number(a.is_popular) === 1 && a.category !== "weekly").sort(placementOrder("popular_order"));   // (same order as the Popular widget)
  // (only what is marked Popular - nothing is added to fill the list)
  const item0 = popularList[0];
  const otherItems = popularList.slice(1, 5);

  if (!item0) {
    container.innerHTML = `<p class="empty-note">अजून कोणतीही बातमी लोकप्रिय केलेली नाही.</p>`;
    return;
  }

  container.innerHTML = `
    <!-- Item 0 Large Card: photo, then the text below it -->
    ${largeCardHTML({
      cls: "drawer-popular-card",
      onclick: `openArticlePage(${item0.id})`,
      link: linkTo(item0),
      imgHTML: fluidImg(item0.image, item0.title, [480, 800], "(max-width: 600px) 100vw, 300px"),
      badge: `<span class="category-tag-badge cat-${item0.category}">${item0.categoryLabel}</span>`,
      title: item0.title,
      byline: `<span class="by-word">by </span>${item0.author} - ${item0.date}`,
    })}

    <!-- Items List (Matching Image 2) -->
    ${otherItems.map(item => `
      <div class="popular-sub-item" onclick="openArticlePage(${item.id})">
        <div class="popular-sub-thumb">
          ${thumbImg(item.image, item.title, 240)}
        </div>
        <div class="popular-sub-content">
          <h5 class="popular-sub-title">${titleLink(item)}</h5>
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

    const tag = tagSearched(q);
    if (tag) {                                       // "#tag": all the stories of that tag
      closeDrawer();
      navigate("tag-" + tag);
      return;
    }
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

      const tag = tagSearched(query);
      if (tag) {                                     // "#tag": all the stories of that tag
        if (bar) bar.classList.remove("show");
        navigate("tag-" + tag);
        return;
      }
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
// ROUTER — one address per view, so the browser's Back / Forward buttons, refresh, shared links and search
// engines all land exactly where you expect (the address is the "?" form; see urlForKey. The route KEY, on the left, is what the code uses):
//
//   (nothing)      Home                 the lead story + the News section
//   weekly         ?cat=weekly          Weekly Edition   all issues (an empty card until the first issue is published)
//   issue-42       ?issue=42            one weekly issue     (previous / next issue; the PDF reader when WEEKLY_PDF is on)
//   cat-rajkiy  cat-samajik  cat-blogs  cat-review      ?cat=rajkiy ...      category sections
//   post-12        ?post=12             one news / blog / review article
//
// Everything that navigates (menu, chips, labels, footer, cards, breadcrumbs, search ...) calls navigate().
// The old "#post-12" style addresses (already shared in chats) still open the same view and are turned into the "?" form.
// =====================================================================================================
let renderedRoute = null;      // canonical key of the view that is on screen
// The backend (Admin Panel data) has not answered yet. Until it does, an address such as ?post=10000 or ?issue=43 may simply
// belong to something the Admin Panel added, so it is not thrown away ("unknown address -> Home") too early.
let apiSyncPending = true;
let backendCounts = false;     // the backend answered: a reader opening a news / blog is counted (countRead)
let routeWaitingForApi = false;
let routeWaitTimer = 0;
let currentView = "home";
let currentArticleId = null;

const routeForArticle = (a) => (a.category === "weekly" && a.issue ? "issue-" + a.issue : "post-" + a.id);
const routeForCategory = (cat) => (cat === "all" ? "" : cat === "weekly" ? "weekly" : "cat-" + cat);

// The ADDRESS of a view:   Home  /        ?cat=weekly  ?cat=rajkiy  ?cat=samajik  ?cat=blogs  ?cat=review        ?post=12        ?issue=42
// Search engines ignore everything after a "#", so a story with a "#post-12" address could never be found in a search; with "?post=12" it is a
// page of its own (listed in the sitemap, see backend/seo.py). An old "#post-12" link still works: it becomes "?post=12" when it is opened.
function queryForKey(key) {
  let m;
  if (!key) return "";
  if (key.startsWith("tag-")) return "tag=" + encodeURIComponent(key.slice(4));
  if (key === "weekly") return "cat=weekly";
  if ((m = key.match(/^(post|issue)-(\d+)$/))) return m[1] + "=" + m[2];
  if ((m = key.match(/^cat-(rajkiy|samajik|blogs|review)$/))) return "cat=" + m[1];
  return "";
}

// PRETTY ADDRESSES: a story is /blog/<words of its title>, /rajkiy/<words>, /samajik/<words>; a section /blog, /rajkiy, /samajik, /review, /weekly; an issue
// /weekly/68. They need a server that answers them: a development PC (the backend) and Vercel (vercel.json) do; the live website does once the deploy has
// added the Amplify rules and switched them on (PRETTY_URLS=1 in js/env-config.js). Everywhere else the ?post=12 form above is used.
const SECTION_PATH = { rajkiy: "rajkiy", samajik: "samajik", blogs: "blog", review: "review" };
const PATH_SECTION = { rajkiy: "rajkiy", samajik: "samajik", blog: "blogs", review: "review" };
const prettyUrlsOn = () => {
  if ((window.LOKMANGAL_ENV || {}).PRETTY_URLS === "1") return true;
  const host = window.location.hostname;
  return /^(localhost|127\.\d+\.\d+\.\d+|\[::1\])$/.test(host) || /\.vercel\.app$/.test(host);
};

// the path (and query) of a view, without the language: "/blog/<words>", "/blog", "/weekly/68", "/?post=12" ...
function pathForKey(key) {
  let m;
  if (prettyUrlsOn()) {
    if (!key) return "/";
    if (key === "weekly") return "/weekly";
    if ((m = key.match(/^cat-(rajkiy|samajik|blogs|review)$/))) return "/" + SECTION_PATH[m[1]];
    if ((m = key.match(/^issue-(\d+)$/))) return "/weekly/" + m[1];
    if ((m = key.match(/^post-(\d+)$/))) {
      const a = articlesData.find((x) => x.id === Number(m[1]));
      if (a && a.slug && SECTION_PATH[a.category]) return "/" + SECTION_PATH[a.category] + "/" + encodeURIComponent(a.slug);
    }
  }
  const query = queryForKey(key);
  return (/^\/(blog|rajkiy|samajik|review|weekly|video)(\/|$)/.test(window.location.pathname) ? "/" : window.location.pathname) + (query ? "?" + query : "");
}

// (the chosen language stays in the address when it came in it: ?lang=en)
function urlForKey(key) {
  const path = pathForKey(key);
  const lang = new URLSearchParams(window.location.search).has("lang") ? "lang=" + getLang() : "";
  return path + (lang ? (path.includes("?") ? "&" : "?") + lang : "");
}

// What a visitor shares or copies. With a backend (the live site) it is the PREVIEW page of the story (backend/seo.py): WhatsApp, Facebook, X and
// Telegram show the story's own title and picture for it, and it sends people on to the website. Without a backend (a static host, a PC) it is
// the website's own address of the story.
const shareUrlFor = (a) => {
  const english = getLang() === "en";
  if (prettyUrlsOn()) {         // the story's own address (/blog/<words>): the server answers it with a page that has the story's title and picture for the preview
    const path = pathForKey(routeForArticle(a));
    return window.location.origin + path + (english ? (path.includes("?") ? "&" : "?") + "lang=en" : "");
  }
  const api = window.LOKMANGAL_CONFIG && window.LOKMANGAL_CONFIG.API_BASE;
  if (api) return api + "/api/share/" + (a.category === "weekly" && a.issue ? "issue/" + a.issue : a.id) + (english ? "?lang=en" : "");
  return window.location.origin + window.location.pathname + "?" + queryForKey(routeForArticle(a)) + (english ? "&lang=en" : "");
};

// a real, crawlable link to a story / issue (a plain click is taken over by the listener below)
const linkTo = (a) => `href="${pathForKey(routeForArticle(a))}" data-route="${routeForArticle(a)}"`;

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
          : r.type === "tag" ? "tag-" + r.tag
            : "";

// the view named in the address: "?post=12" (or ?issue= / ?cat=); null when the query names none
function routeFromQuery(search) {
  const q = new URLSearchParams(search);
  const unknown = { type: "home", unknown: true };
  if (q.has("post")) return /^\d+$/.test(q.get("post")) ? { type: "post", id: parseInt(q.get("post"), 10) } : unknown;
  if (q.has("issue")) return /^\d+$/.test(q.get("issue")) ? { type: "issue", no: parseInt(q.get("issue"), 10) } : unknown;
  if (q.has("tag")) { const tag = q.get("tag").trim(); return tag && tag.length <= 80 ? { type: "tag", tag } : unknown; }
  if (q.has("cat")) {
    const cat = q.get("cat");
    return cat === "weekly" ? { type: "weekly" } : /^(rajkiy|samajik|blogs|review)$/.test(cat) ? { type: "cat", cat } : unknown;
  }
  return null;
}

// the story with these words in its address - or the one that had them before (old_slugs: an address made shorter later)
const articleBySlug = (slug) => articlesData.find((a) => a.slug === slug) || articlesData.find((a) => String(a.old_slugs || "").split(",").includes(slug));

// the view named by a pretty address: /blog/<words> (the story is found by its words; its id is not known until the stories are loaded), /blog, /weekly/68 ...
function routeFromPath(pathname) {
  let parts;
  try { parts = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, "").split("/"); } catch (e) { return null; }
  const first = parts[0];
  if (parts.length === 1 && first === "weekly") return { type: "weekly" };
  if (parts.length === 1 && PATH_SECTION[first]) return { type: "cat", cat: PATH_SECTION[first] };
  if (parts.length === 2 && first === "weekly") return /^\d+$/.test(parts[1]) ? { type: "issue", no: parseInt(parts[1], 10) } : { type: "home", unknown: true };
  if (parts.length === 2 && PATH_SECTION[first] && parts[1]) {
    const article = articleBySlug(parts[1]);
    return { type: "post", slug: parts[1], id: article ? article.id : undefined };
  }
  return null;
}

// (an old "?post=12" and "#post-12" address is understood too)
const routeFromLocation = () => routeFromPath(window.location.pathname) || routeFromQuery(window.location.search) || parseRoute(window.location.hash);

// The address bar shows a page's own (pretty) address: an old ?post=12 / ?cat=blogs / #post-12 address, or /index.html, is turned into it.
function normalizeAddress() {
  if (renderedRoute === null) return;
  const named = routeFromPath(window.location.pathname);
  const before = named && named.slug && named.id && !articlesData.some((a) => a.slug === named.slug);      // words the story had before
  const old = before || routeFromQuery(window.location.search) || (window.location.hash && parseRoute(window.location.hash).type !== "home") || /\/index\.html$/.test(window.location.pathname);
  if (old && urlForKey(renderedRoute) !== window.location.pathname + window.location.search) replaceUrl(renderedRoute);
}

const currentRouteKey = () => routeKeyOf(routeFromLocation());

function replaceUrl(key) {
  try { history.replaceState(history.state, "", urlForKey(key)); } catch (e) { /* ignore */ }
}

// remember how far the page was scrolled, so Back lands on the same spot of the list
function rememberScroll() {
  try { history.replaceState({ ...(history.state || {}), y: window.scrollY }, ""); } catch (e) { /* ignore */ }
}

function setDocTitle(text) {
  const site = trUI("लोकमंगल न्यूज पोर्टल");
  document.title = text ? `${trUI(text)} | ${site}` : site;
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
    history.pushState({ route: key }, "", urlForKey(key));
    renderRoute({ scroll: true });
  });
};

// Every link to a view of the site has a real address (it can be found, opened in a new tab, copied). A plain click is taken over here so the
// page does not reload: a link with its own onclick (the menu) goes on to it, any other (a story's title inside a card) navigates here.
// A click with Ctrl / Cmd / Shift / Alt or the middle button is left to the browser (a new tab) - and the card around the link must not react to it.
document.addEventListener("click", (e) => {
  const link = e.target.closest ? e.target.closest("a[data-route]") : null;
  if (!link || e.defaultPrevented) return;
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { e.stopPropagation(); return; }
  e.preventDefault();
  if (!link.hasAttribute("onclick")) {
    e.stopPropagation();
    navigate(link.getAttribute("data-route"));
  }
}, true);

// A short note while we wait for the backend's first answer (only for addresses we do not know yet)
function showRouteLoading() {
  routeWaitingForApi = true;
  const container = document.getElementById("main-content-container");
  if (container) container.innerHTML = `<p class="empty-note" role="status"><i class="fa-solid fa-spinner fa-spin"></i> लोड होत आहे…</p>`;
  if (!routeWaitTimer) {
    routeWaitTimer = setTimeout(() => {   // the backend is not answering: stop waiting and behave as before (unknown address -> Home)
      if (apiSyncPending) {
        apiSyncPending = false;
        routeWaitingForApi = false;
        renderRoute({ scroll: false });
      }
    }, 7000);
  }
}

// Draw the view that belongs to the current address
function renderRoute({ scroll = true, restoreY = null } = {}) {
  const r = routeFromLocation();
  let article = null;
  if (r.type === "issue") article = issueByNo(r.no);
  if (r.type === "post") article = articlesData.find((a) => a.id === r.id);

  // unknown / stale addresses fall back to Home (and the address bar is cleaned up) ...
  if ((r.type === "issue" || r.type === "post") && !article) {
    // ... but not before the backend has answered: it may be an article / issue the Admin Panel added (shared link, refresh, bookmark)
    if (apiSyncPending) {
      showRouteLoading();
      return;
    }
    replaceUrl("");
    return renderRoute({ scroll, restoreY });
  }
  // The Weekly page of a site without an issue is its empty card - but a shared #weekly link first waits for the backend's
  // answer (it may bring the issues added in the Admin Panel), so the empty card does not flash up before them.
  if (r.type === "weekly" && !latestIssue() && apiSyncPending) {
    showRouteLoading();
    return;
  }
  if (r.type === "tag" && !storiesWithTag(r.tag).length && apiSyncPending) {     // (the tag may belong to a story the backend still brings)
    showRouteLoading();
    return;
  }
  if (r.unknown) replaceUrl("");
  // an old "#post-<weekly article id>" link becomes the proper "#issue-<number>" address
  if (r.type === "post" && article.category === "weekly" && article.issue) replaceUrl("issue-" + article.issue);

  if (r.type === "tag") {
    currentCategory = "tag";
    renderedRoute = routeKeyOf(r);
    renderTagView(r.tag);
    updateNavActiveStates(currentCategory);
    setDocTitle(`#${r.tag}`);
    seoForView("tag", renderedRoute, { tag: r.tag });
  } else if (article) {
    renderedRoute = routeForArticle(article);
    renderArticleView(article);
    updateNavActiveStates(article.category);
    setDocTitle(article.issue ? `${issueLabel(article) || article.title} • साप्ताहिक आवृत्ती` : article.title);
    seoForView(article.issue ? "issue" : "post", renderedRoute, { article });
    countRead(article);
  } else {
    currentCategory = r.type === "weekly" ? "weekly" : r.type === "cat" ? r.cat : "all";
    const first = sectionArticles(currentCategory)[0];
    mainStoryId = currentCategory === "all"
      // Home: the story marked "Lead Story" in the Admin Panel; without one, the first Rajkiy story
      ? (articlesData.find((a) => Number(a.is_lead) === 1 && a.category !== "weekly")?.id
         || articlesData.find((a) => a.category === "rajkiy")?.id || 1)
      : currentCategory === "weekly"
        ? (latestIssue()?.id ?? 1)
        : (first ? first.id : 1);
    renderedRoute = routeKeyOf(r.type === "home" ? { type: "home" } : r);
    renderHomeFeed();
    updateNavActiveStates(currentCategory);
    if (!videoSlugInPath()) {                           // (a video's address is Home under the video: the page keeps the video's title and tags)
      setDocTitle(currentCategory === "all" ? "" : getMarathiCategory(currentCategory));
      seoForView(currentCategory === "all" ? "home" : "section", renderedRoute, { section: currentCategory });
    }
  }
  normalizeAddress();

  if (restoreY !== null) window.scrollTo(0, restoreY);
  else if (scroll) window.scrollTo({ top: 0, behavior: "auto" });
}

// What search engines and a pasted link read for the view that is on the screen (js/seo.js): title, description, canonical address, preview
// tags, structured data. The page works without it.
function seoForView(kind, key, { article = null, section = "", tag = "" } = {}) {
  if (!window.LokmangalSEO) return;
  window.LokmangalSEO.apply({
    kind, section, article, tag, path: pathForKey(key).slice(1),
    sectionPath: article ? pathForKey(routeForCategory(article.category)).slice(1) : "",
  });
}

function initRouter() {
  try { history.scrollRestoration = "manual"; } catch (e) { /* ignore */ }
  // an old "#post-12" / "#cat-blogs" / "#weekly" address (shared before the views had real addresses) becomes "?post=12" ... before the first draw
  if (!routeFromPath(window.location.pathname) && !routeFromQuery(window.location.search)) {
    const old = parseRoute(window.location.hash);
    if (!old.unknown && routeKeyOf(old)) replaceUrl(routeKeyOf(old));
  }
  // the first entry gets a state object too, so coming Back to it can restore the scroll position
  try { history.replaceState({ ...(history.state || {}), route: currentRouteKey() }, ""); } catch (e) { /* ignore */ }
  renderRoute({ scroll: false });
  window.addEventListener("hashchange", () => {     // an old-style "#post-12" typed into the address bar / clicked inside the open page
    if (!window.location.hash) return;                                     // (the "#" went away: Back / Forward is handled by popstate)
    const old = parseRoute(window.location.hash);
    replaceUrl(old.unknown ? "" : routeKeyOf(old));                        // "#post-12" -> "?post=12"; "#whatever" -> the clean address of Home
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

// Every view has exactly ONE h1 (search engines use it to understand the page). Home and the sections name themselves in a visually hidden h1 -
// the breadcrumb already shows the same words - and the lead story's headline under it is an h2, so the story is not "the h1" of three addresses.
const pageHeading = (kind, section) => {
  const text = window.LokmangalSEO && window.LokmangalSEO.heading
    ? window.LokmangalSEO.heading(kind, section)
    : (kind === "home" ? "लोकमंगल न्यूज पोर्टल" : getMarathiCategory(section));
  return `<h1 class="visually-hidden">${text}</h1>`;
};

// (an item with a `route` key is a real link: "" = Home, "cat-rajkiy" ...)
const hrefForKey = (key) => pathForKey(key);
const crumbHTML = (items) => items.map((it, i) => {
  const sep = i ? `<i class="fa-solid fa-chevron-right"></i>` : "";
  return sep + (it.onclick
    ? `<a href="${it.route === undefined ? "javascript:void(0)" : hrefForKey(it.route)}"${it.route === undefined ? "" : ` data-route="${it.route}"`} onclick="${it.onclick}">${it.label}</a>`
    : `<span class="crumb-current">${it.label}</span>`);
}).join("");

// ---- ONE TAG: every news / blog / review that carries it ----
function renderTagView(tag) {
  currentView = "tag";
  currentArticleId = null;
  const container = document.getElementById("main-content-container");
  if (!container) return;
  const stories = storiesWithTag(tag);
  const name = `#${escText(tag)}`;
  const count = getLang() === "en" ? `${stories.length} ${stories.length === 1 ? "story" : "stories"}`
    : `${toDevanagari(stories.length)} ${stories.length === 1 ? "बातमी" : "बातम्या"}`;
  container.className = "main-content-box view-tag";
  container.innerHTML = `
    <div class="breadcrumb-bar" id="main-breadcrumb">
      ${crumbHTML([{ label: "Home", onclick: "returnToHomeFeed()", route: "" }, { label: `<span data-no-i18n>${name}</span>` }])}
    </div>
    <h1 class="tag-page-title" id="main-headline-text" data-no-i18n>${name}</h1>
    <p class="tag-page-count" data-no-i18n>${count}</p>
    <div id="secondary-posts-feed">${stories.length ? stories.map(postRowHTML).join("") : `<p class="empty-note">या टॅगच्या बातम्या सध्या नाहीत.</p>`}</div>`;
}

// ---- HOME: latest news story first, then the News section ----
function renderHomeView(container) {
  homeNewsLimit = 8;
  const article = (mainStoryId && articlesData.find((a) => a.id === mainStoryId && a.category !== "weekly"))
    || articlesData.find((a) => Number(a.is_lead) === 1 && a.category !== "weekly")
    || articlesData.find((a) => a.category === "rajkiy")
    || articlesData.find((a) => a.category === "samajik")
    || articlesData[0];

  container.className = "main-content-box view-home";
  container.innerHTML = `
    <div class="breadcrumb-bar" id="main-breadcrumb">
      ${crumbHTML([
        { label: "Home", onclick: "returnToHomeFeed()", route: "" },
        { label: article.categoryLabel, onclick: `setCategoryFilter('${article.category}')`, route: routeForCategory(article.category) },
        { label: "प्रमुख बातमी (Lead Story)" },
      ])}
    </div>

    ${pageHeading("home")}
    ${leadStoryHTML(article, { label: `ताज्या घडामोडी • ${article.categoryLabel}`, heading: "h2" })}

    <!-- News section: Samajik + Rajkiy -->
    ${newsHeadHTML()}
    <div id="secondary-posts-feed">
      <!-- Populated below -->
    </div>
  `;
  renderSecondaryPosts();
}

// ---- WEEKLY EDITION section: every issue with its PDF ----
function renderWeeklySection(container) {
  const issues = weeklyIssues();
  container.className = "main-content-box view-weekly";
  container.innerHTML = `
    <div class="breadcrumb-bar" id="main-breadcrumb">
      ${crumbHTML([
        { label: "Home", onclick: "returnToHomeFeed()", route: "" },
        { label: "साप्ताहिक आवृत्ती (Weekly Edition)" },
      ])}
    </div>

    <h1 class="visually-hidden" id="main-headline-text">साप्ताहिक आवृत्ती</h1>

    ${issues.length ? `${weeklyLatestHTML(issues[0])}

    <div id="secondary-posts-feed">
      <!-- Populated below -->
    </div>` : weeklyEmptyHTML()}
  `;
  if (!issues.length) return;            // nothing to list, nothing to ask the server about
  renderSecondaryPosts();
  if (WEEKLY_PDF) {
    hydratePdfInfo(container);
    hydratePdfInfoLazily(container);
  }
}

// The Weekly Edition before its first issue: one calm card (no list, no search box, no PDF button)
function weeklyEmptyHTML() {
  return `
    <div class="weekly-empty" role="status">
      <span class="weekly-empty-icon"><i class="fa-regular fa-newspaper"></i></span>
      <h2 class="weekly-empty-title">सध्या एकही अंक उपलब्ध नाही</h2>
      <p class="weekly-empty-text">लोकमंगल साप्ताहिकाचे नवीन अंक लवकरच येथे ${WEEKLY_PDF ? "ऑनलाईन वाचता येतील व मोफत डाउनलोड करता येतील" : "प्रकाशित होतील"}. तोपर्यंत ताज्या बातम्या वाचा.</p>
      <button type="button" class="btn-archive-pill" onclick="returnToHomeFeed()"><i class="fa-solid fa-house" style="color:var(--accent-red)"></i> ताज्या बातम्या वाचा</button>
    </div>`;
}

function weeklyLatestHTML(a) {
  const pdf = pdfUrlFor(a);
  return `
    <article class="weekly-latest">
      <div class="weekly-latest-cover" onclick="openArticlePage(${a.id})">
        ${fluidImg(a.image, issueLabel(a) + " — " + a.title, [480, 800, 1200], "(max-width: 980px) 100vw, 320px", HERO_IMG_ATTRS)}
      </div>
      <div class="weekly-latest-info">
        <span class="latest-chip"><i class="fa-solid fa-bolt"></i> नवीनतम अंक</span>
        <h2 class="weekly-latest-title" onclick="openArticlePage(${a.id})">${titleLink(a)}</h2>
        <div class="weekly-latest-meta">
          <span><i class="fa-regular fa-calendar"></i> ${a.date}</span>
          ${hasViews(a.views) ? `<span><i class="fa-regular fa-eye"></i> ${a.views} वाचक</span>` : ""}
        </div>
        ${a.excerpt ? `<p class="weekly-latest-excerpt">${inlineHTML(a.excerpt)}</p>` : ""}
        ${WEEKLY_PDF ? `<div class="weekly-latest-actions" data-pdf-url="${pdf}">
          <button class="btn-pdf-read" data-pdf-action onclick="openWeeklyModal(${a.id})"><i class="fa-solid fa-book-open"></i> PDF ऑनलाईन वाचा</button>
          <button class="btn-card-read" onclick="openArticlePage(${a.id})"><i class="fa-solid fa-arrow-right"></i> अंकाचे पान</button>
          <a class="btn-pdf-dl" data-pdf-action ${pdfLinkAttrs(pdf, a.issue)}><i class="fa-solid fa-download"></i> डाउनलोड<span class="pdf-size"></span></a>
          <p class="pdf-missing-note" hidden><i class="fa-regular fa-clock"></i> या अंकाचा PDF लवकरच उपलब्ध होईल.</p>
        </div>` : `<div class="weekly-latest-actions">
          <button class="btn-card-read" onclick="openArticlePage(${a.id})"><i class="fa-solid fa-arrow-right"></i> अंकाचे पान</button>
        </div>`}
      </div>
    </article>`;
}

// ---- CATEGORY sections (Samajik, Rajkiy, Blogs, Reviews = the news and blogs with the most views) ----
function renderCategorySection(container, cat) {
  const article = articlesData.find((a) => a.id === mainStoryId) || sectionArticles(cat)[0] || latestIssue() || articlesData[0];
  const [moreIcon, moreTitle] = { blogs: ["fa-pen-nib", "इतर ब्लॉग्स"], review: ["fa-fire", "सर्वाधिक वाचलेल्या इतर बातम्या व ब्लॉग्स"] }[cat]
    || ["fa-newspaper", "इतर ताज्या बातम्या"];
  container.className = "main-content-box view-home";
  container.innerHTML = `
    <div class="breadcrumb-bar" id="main-breadcrumb">
      ${crumbHTML([
        { label: "Home", onclick: "returnToHomeFeed()", route: "" },
        { label: getMarathiCategory(cat) },
      ])}
    </div>

    ${pageHeading("section", cat)}
    ${leadStoryHTML(article, { heading: "h2" })}

    <div class="more-posts-header">
      <h2 class="more-posts-title"><i class="fa-solid ${moreIcon}" style="color:var(--main-color); margin-right:6px"></i> ${moreTitle}</h2>
    </div>
    <div id="secondary-posts-feed">
      <!-- Populated below -->
    </div>
  `;
  renderSecondaryPosts();
}

// The publication date under a headline (the date typed in the Admin Panel, "प्रकाशन तारीख"), in small letters. <time> also gives it as
// yyyy-mm-dd when the date can be read.
// A news / blog / review shows the full "Published on: Nov 21, 2026, 14:05:07 IST" line (publishedLineHTML: the time is `published_at`); a weekly
// issue shows just its date.
function headlineDateHTML(article) {
  if (article && !(article.category === "weekly" && article.issue)) return publishedLineHTML(article);   // a news / blog / review: "Published on: Nov 21, 2026, 14:05:07 IST"
  const text = String((article && article.date) || "").trim();
  if (!text) return "";
  const v = dateValue(text);
  const iso = v ? `${Math.floor(v / 10000)}-${String(Math.floor(v / 100) % 100).padStart(2, "0")}-${String(v % 100).padStart(2, "0")}` : "";
  return `<p class="headline-date"><i class="fa-regular fa-calendar" aria-hidden="true"></i> <time${iso ? ` datetime="${iso}"` : ""}>${text}</time></p>`;
}

// the big first story (Home, Weekly lead and category sections share it)
function leadStoryHTML(article, { pdf = false, label = "", heading = "h1" } = {}) {
  const open = `openArticlePage(${article.id})`;
  const isIssue = article.category === "weekly" && article.issue;
  return `
    <${heading} class="main-post-headline" id="main-headline-text" onclick="${open}" style="cursor:pointer">
      ${titleLink(article)}
    </${heading}>
    ${headlineDateHTML(article)}

    <div class="main-featured-media" id="main-featured-img-wrap" onclick="${open}">
      ${fluidImg(article.image, article.title, [480, 800, 1200], "(max-width: 980px) 100vw, 700px", `${HERO_IMG_ATTRS} id="main-story-image"`)}
    </div>

    <div class="main-article-body" id="main-story-body">
      <p><strong>${article.categoryLabel} विशेष अहवाल:</strong> ${inlineHTML(article.excerpt)}</p>
      <p>${teaserHTML(article.content)}</p>
    </div>

    <div class="home-post-footer-bar">
      <div class="footer-readmore-wrap">
        <button class="btn-xapify-readmore" onclick="${open}">
          Read More <i class="fa-solid fa-arrow-right"></i>
        </button>
        ${pdf && isIssue && WEEKLY_PDF ? `
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
          <a href="https://twitter.com/intent/tweet?text=${t}&url=${u}" target="_blank" rel="noopener noreferrer" class="x-share-btn share-x" title="X वर शेअर करा">
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
let homeNewsLimit = 8;          // Initially show 8 news stories

function newsHeadHTML() {
  const pill = (key, label) => `<button type="button" class="news-pill${homeNewsFilter === key ? " active" : ""}" data-news="${key}" aria-pressed="${homeNewsFilter === key}" onclick="setHomeNewsFilter('${key}')">${label}</button>`;
  const titleText = "ताज्या बातम्या";          // the source text is Marathi; js/i18n.js shows it in English when English is chosen
  const allLabel = "सर्व";
  const samajikLabel = "सामाजिक";
  const rajkiyLabel = "राजकीय";
  return `
    <div class="more-posts-header news-section-head">
      <h2 class="more-posts-title"><i class="fa-solid fa-newspaper" style="color:var(--main-color); margin-right:6px"></i> ${titleText}</h2>
      <div class="news-pills" role="group" aria-label="बातम्यांचा विभाग">
        ${pill("all", allLabel)}${pill("samajik", samajikLabel)}${pill("rajkiy", rajkiyLabel)}
      </div>
    </div>`;
}

window.setHomeNewsFilter = function(filter) {
  homeNewsFilter = filter;
  homeNewsLimit = 8; // Reset back to 8 when changing filter
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
        <h4 class="secondary-post-title">${titleLink(item)}</h4>
        <div class="secondary-post-meta">
          <span class="cat-chip cat-${item.category}">${item.categoryLabel}</span>
          <span class="meta-dot">•</span>
          <span>${item.date}</span>
          <span class="meta-dot">•</span>
          <span><i class="fa-regular fa-eye"></i> ${viewsText(item)}</span>
        </div>
      </div>
    </div>`;
}

// News section on Home: first story as a big card, up to homeNewsLimit stories, then Load More
function newsListHTML(filter) {
  const currentLeadId = (currentCategory === "all")
    ? ((mainStoryId && articlesData.find((a) => a.id === mainStoryId && a.category !== "weekly")?.id)
       || articlesData.find((a) => Number(a.is_lead) === 1 && a.category !== "weekly")?.id
       || 1)
    : mainStoryId;

  // (a news the Admin Panel un-ticked under "ताज्या बातम्या" is not listed here; one without the flag - built-in, older backend - is)
  const list = articlesData.filter((a) => NEWS_CATEGORIES.includes(a.category) && (filter === "all" || a.category === filter) && a.id !== currentLeadId && Number(a.is_latest ?? 1) !== 0);
  if (!list.length) return `<p class="empty-note">या विभागात बातम्या लवकरच जोडल्या जातील.</p>`;

  // Slice to homeNewsLimit (default 8 items: 1 big card + 7 rows)
  const visibleList = list.slice(0, homeNewsLimit);
  const hasMore = list.length > homeNewsLimit;
  const remainingCount = list.length - homeNewsLimit;

  const [first, ...rest] = visibleList;

  const loadBtnText = "अधिक बातम्या";
  const allLoadedText = `सर्व ${toDevanagari(list.length)} बातम्या दाखवल्या आहेत`;

  const loadMoreBtnHTML = hasMore ? `
    <div class="load-more-wrap" id="home-load-more-wrap">
      <button type="button" class="btn-load-more" onclick="loadMoreHomeNews()">
        <i class="fa-solid fa-angles-down"></i>
        <span>${loadBtnText}</span>
      </button>
    </div>` : (list.length > 8 ? `
    <div class="load-more-end">
      <i class="fa-solid fa-circle-check"></i> ${allLoadedText}
    </div>` : "");

  return `
    ${largeCardHTML({
      cls: "news-featured",
      onclick: `openArticlePage(${first.id})`,
      link: linkTo(first),
      imgHTML: fluidImg(first.image, first.title, [480, 800, 1200], "(max-width: 980px) 100vw, 640px"),
      badge: `<span class="category-tag-badge cat-${first.category}">${first.categoryLabel}</span>`,
      title: first.title,
      titleTag: "h3",
      byline: `${first.date} • <i class="fa-regular fa-eye"></i> ${viewsText(first)}`,
    })}
    ${rest.map(postRowHTML).join("")}
    ${loadMoreBtnHTML}`;
}

window.loadMoreHomeNews = function() {
  homeNewsLimit += 8;
  const feed = document.getElementById("secondary-posts-feed");
  if (feed && currentCategory === "all") {
    feed.innerHTML = newsListHTML(homeNewsFilter);
  }
};

// The Weekly page lists the latest WEEKLY_PAGE issues; "अधिक वाचा" shows the rest (a search always looks through all of them).
// The choice is kept while the visitor opens an issue and comes back.
const WEEKLY_PAGE = 10;
let weeklyExpanded = false;
let weeklyYear = "";            // "" = every year; "2026" = only the issues of that year (kept like weeklyExpanded)
const yearOfDate = (text) => { const v = dateValue(text); return v ? String(Math.floor(v / 10000)) : ""; };

function weeklyRowHTML(item, folded) {
  return `
    <div class="secondary-post-item weekly-edition-item" data-year="${yearOfDate(item.date)}" data-search="${escText([item.title, item._mr_title, item.title_en, item.date, item._mr_date, plainOf(item.excerpt), plainOf(item._mr_excerpt), plainOf(item.excerpt_en)].filter(Boolean).join(" ").toLowerCase())}"${folded ? ' style="display:none"' : ""} onclick="openArticlePage(${item.id})">
      <div class="secondary-post-thumb">
        ${thumbImg(item.thumb || item.image, issueLabel(item) + " — " + item.title, 320)}
      </div>
      <div class="secondary-post-details">
        <h4 class="secondary-post-title">${titleLink(item)}</h4>
        <div class="secondary-post-meta">
          <span style="color:var(--accent-red); font-weight:700"><i class="fa-regular fa-newspaper"></i> ${WEEKLY_PDF ? "ई-पेपर" : "साप्ताहिक"}</span>
          <span class="meta-dot">•</span>
          <span>${item.date}</span>
          ${hasViews(item.views) ? `<span class="meta-dot">•</span>
          <span><i class="fa-regular fa-eye"></i> ${item.views}</span>` : ""}
        </div>
        <div class="weekly-card-actions"${WEEKLY_PDF ? ` data-pdf-url="${pdfUrlFor(item)}" data-pdf-lazy` : ""} onclick="event.stopPropagation()">
          <button class="btn-card-read" onclick="openArticlePage(${item.id})">
            <i class="fa-solid fa-book-open"></i> वाचा
          </button>
          ${WEEKLY_PDF ? `<button class="btn-card-pdf" data-pdf-action onclick="openWeeklyModal(${item.id})">
            <i class="fa-solid fa-file-pdf"></i> PDF ई-पेपर
          </button>` : ""}
        </div>
      </div>
    </div>`;
}

function weeklyArchiveHTML() {
  const list = weeklyIssues();
  const folded = !weeklyExpanded && list.length > WEEKLY_PAGE;      // only the latest WEEKLY_PAGE are shown
  const years = [...new Set(list.map((it) => yearOfDate(it.date)).filter(Boolean))].sort((a, b) => b - a);   // newest year first
  if (weeklyYear && !years.includes(weeklyYear)) weeklyYear = "";
  const pill = (y, label) => `<button type="button" class="news-pill weekly-year-pill${weeklyYear === y ? " active" : ""}" data-year="${y}" aria-pressed="${weeklyYear === y}" onclick="setWeeklyYear('${y}')">${label}</button>`;
  return `
    <div class="weekly-search-filter-bar">
      <div class="weekly-search-input-wrap">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="weekly-filter-input" enterkeyhint="search" autocomplete="off" placeholder="तारीख, महिना किंवा विषय शोधा (उदा. ऑगस्ट २०२६, विमानसेवा, शेतकरी)..." oninput="filterWeeklyIssuesList(this.value)" />
      </div>
    </div>
    ${years.length > 1 ? `<div class="news-pills weekly-year-pills" role="group" aria-label="वर्षानुसार अंक">${pill("", "सर्व")}${years.map((y) => pill(y, toDevanagari(y))).join("")}</div>` : ""}
    <div class="weekly-editions-container" id="weekly-editions-list">
      ${list.map((item, i) => weeklyRowHTML(item, folded && i >= WEEKLY_PAGE)).join("")}
    </div>
    <div class="load-more-wrap" id="weekly-load-more-wrap"${folded ? "" : " hidden"}>
      <button type="button" class="btn-load-more" onclick="showAllWeeklyIssues()">
        <i class="fa-solid fa-angles-down"></i>
        <span>अधिक वाचा</span>
        <span class="load-more-count">${toDevanagari(Math.max(0, list.length - WEEKLY_PAGE))} अंक</span>
      </button>
    </div>
    <div class="load-more-end" id="weekly-load-end"${!folded && list.length > WEEKLY_PAGE ? "" : " hidden"}>
      <i class="fa-solid fa-circle-check"></i> सर्व ${toDevanagari(list.length)} अंक दाखवले आहेत
    </div>
    <p class="empty-note" id="weekly-empty-note" hidden>असा अंक सापडला नाही. दुसरा शब्द, महिना किंवा तारीख शोधा.</p>`;
}

function renderSecondaryPosts() {
  const container = document.getElementById("secondary-posts-feed");
  if (!container) return;

  if (currentCategory === "all") {            // Home: the News section
    container.innerHTML = newsListHTML(homeNewsFilter);
    return;
  }
  if (currentCategory === "weekly") {         // Weekly Edition: every issue
    container.innerHTML = weeklyArchiveHTML();
    filterWeeklyIssuesList("");               // applies the kept year / "अधिक वाचा" state to the fresh list
    return;
  }

  // other categories (Rajkiy, Samajik, Blogs, Review): the rest of the section
  const list = sectionArticles(currentCategory).filter((a) => a.id !== mainStoryId);
  // Blogs: the lead story + the next ones make BLOGS_SHOWN; the other blogs open with "अधिक वाचा"
  const isBlogs = currentCategory === "blogs";
  const rows = isBlogs && !blogsExpanded ? list.slice(0, BLOGS_SHOWN - 1) : list;
  container.innerHTML = list.length
    ? rows.map(postRowHTML).join("") + (isBlogs ? moreButtonHTML("blogs", list.length, BLOGS_SHOWN - 1, blogsExpanded) : "")
    : `<p class="empty-note">या विभागात इतर बातम्या लवकरच जोडल्या जातील.</p>`;
}

// Live filter for the weekly archive: a month ("ऑगस्ट"), a year ("२०२६"), a date ("२६ ऑगस्ट") or a word of the headline / text ("विमानसेवा").
// (Digits may be typed as Marathi or as ordinary numerals.)
window.filterWeeklyIssuesList = function(query) {
  const q = devToAscii((query || "").trim().toLowerCase());
  const items = document.querySelectorAll("#weekly-editions-list .weekly-edition-item");
  // "सर्व" years and no search: only the latest WEEKLY_PAGE are shown until "अधिक वाचा"; a search or a year shows every issue that matches
  const filtering = !!q || !!weeklyYear;
  const folded = !filtering && !weeklyExpanded && items.length > WEEKLY_PAGE;
  let count = 0;
  items.forEach((el, i) => {
    const matches = (!weeklyYear || el.dataset.year === weeklyYear)
      && (!q || devToAscii(((el.dataset.search || "") + " " + el.innerText).toLowerCase()).includes(q));
    el.style.display = matches && !(folded && i >= WEEKLY_PAGE) ? "" : "none";
    if (matches) count++;
  });
  const empty = document.getElementById("weekly-empty-note");
  if (empty) empty.hidden = count !== 0;
  const more = document.getElementById("weekly-load-more-wrap");
  if (more) more.hidden = !folded;
  const end = document.getElementById("weekly-load-end");
  if (end) end.hidden = filtering || folded || items.length <= WEEKLY_PAGE;
  document.querySelectorAll(".weekly-year-pill").forEach((b) => {
    const on = b.dataset.year === weeklyYear;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", String(on));
  });
};

// Year pills under the search box: one year, or "सर्व" (""). The search box keeps working inside the chosen year.
window.setWeeklyYear = function(year) {
  weeklyYear = year || "";
  const input = document.getElementById("weekly-filter-input");
  filterWeeklyIssuesList(input ? input.value : "");
};

// "अधिक वाचा": show the issues that were left out (the rows are already in the page, their pictures load when they appear)
window.showAllWeeklyIssues = function() {
  weeklyExpanded = true;
  const input = document.getElementById("weekly-filter-input");
  filterWeeklyIssuesList(input ? input.value : "");
};

// --- Comments: readers write under every news / blog / weekly issue, the API keeps them (/api/comments) ---
// Replies are one level deep (a reply to a reply is saved under its top-level comment, with "@Name " in front). Likes / dislikes and reports go to
// the API too. The texts are Marathi; js/i18n.js turns them into English like everything else on the page.
const COMMENT_PAGE = 10;             // top-level comments shown at first, and added by "आणखी प्रतिक्रिया पहा"
const REPLY_PAGE = 3;                // replies shown when a thread is opened
const COMMENT_MAX = 2000;
const COMMENT_NAME_MAX = 60;
const COMMENT_FRESH_MS = 60000;      // a list loaded less than this long ago is not asked for again (a language switch draws the page again)
const COMMENT_STAR_MIN = 3;          // likes + dislikes + replies a comment needs for the "सर्वाधिक प्रतिसाद" badge
const COMMENT_MONTHS = ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"];
const COMMENT_ERRORS = {
  invalid: "कृपया तुमची प्रतिक्रिया (१–२००० अक्षरे) तपासा.",
  login: "प्रतिक्रिया देण्यासाठी साइन इन करा.",
  missing: "ही प्रतिक्रिया किंवा बातमी सापडली नाही.",
  limit: "थोड्या वेळाने पुन्हा प्रयत्न करा",
  network: "इंटरनेट जोडणी तपासा व पुन्हा प्रयत्न करा.",
  server: "काहीतरी चुकले, थोड्या वेळाने पुन्हा प्रयत्न करा.",
  name: "कृपया तुमचे पूर्ण नाव लिहा.",
  email: "कृपया योग्य ईमेल आयडी लिहा.",
  mobile: "कृपया १० अंकी मोबाईल नंबर लिहा.",
  captcha: "बेरीज चुकली, पुन्हा प्रयत्न करा.",
  code: "हा कोड बरोबर नाही.",
  expired: "कोडची मुदत संपली, नवा कोड मागवा.",
  wait: "कोड आत्ताच पाठवला आहे, एक मिनिट थांबा.",
  mail: "ईमेल पाठवता आला नाही, पुन्हा प्रयत्न करा.",
  taken: "या ईमेलचे खाते आहे — Google किंवा ईमेल कोडने साइन इन करा.",
  google: "Google साइन-इन जमले नाही, पुन्हा प्रयत्न करा.",
};

const commentLists = {};             // "article:12" -> its state: { type, id, status, total, comments, shown, open, loadedAt, draft }
let commentCurrent = null;           // the state of the story on screen

// who is writing: a random id this browser makes once (the API keeps only a hash of it, to know "your" vote). Without storage it lasts one page view.
let commentVisitorMemory = "";
function commentVisitor() {
  try {
    const saved = localStorage.getItem("lokmangal-visitor");
    if (saved && /^[A-Za-z0-9-]{8,64}$/.test(saved)) return saved;
  } catch (e) { /* storage blocked */ }
  if (commentVisitorMemory) return commentVisitorMemory;
  let id = "";
  try { id = crypto.randomUUID(); } catch (e) { /* an old browser */ }
  if (!id) id = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  commentVisitorMemory = id;
  try { localStorage.setItem("lokmangal-visitor", id); } catch (e) { /* storage blocked */ }
  return id;
}

// who is writing: the reader who signed in on this browser (see the dialog below). The token goes with every comment he writes.
let commentUser = null;
try {
  const saved = JSON.parse(localStorage.getItem("lokmangal-commenter") || "null");
  if (saved && typeof saved.token === "string" && saved.name) commentUser = saved;
} catch (e) { /* storage blocked or damaged: signed out */ }

function commentSetUser(user) {
  commentUser = user;
  try {
    if (user) localStorage.setItem("lokmangal-commenter", JSON.stringify(user));
    else localStorage.removeItem("lokmangal-commenter");
  } catch (e) { /* storage blocked: signed in until the page is closed */ }
  paintCommentIdentity();
}

// one call of the API (`path` is what follows /api/): the answer, or an exception { kind } - invalid | login | missing | limit | network | server,
// or the API's own reason (name, email, captcha, code, expired, wait, mail, taken, google)
async function commentApi(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/${path}`, body === undefined ? {} : {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitor: commentVisitor(), ...body }),
    });
  } catch (e) {
    throw { kind: "network" };
  }
  let data = null;
  try { data = await res.json(); } catch (e) { /* no JSON */ }
  if (res.ok && data && data.success !== false) return data;
  const reason = data && data.reason;
  throw { kind: reason || (res.status === 401 ? "login" : res.status === 429 ? "limit" : res.status === 404 ? "missing" : res.status === 400 ? "invalid" : "server") };
}

const commentItemOf = (article) => (article.category === "weekly" && article.issue ? { type: "weekly", id: article.issue } : { type: "article", id: article.id });
const commentFind = (state, id) => {
  for (const top of state.comments) {
    if (top.id === id) return top;
    const reply = top.replies.find((r) => r.id === id);
    if (reply) return reply;
  }
  return null;
};

// the comment people reacted to most is shown first and carries the badge; the others stay newest first
function commentOrder(list) {
  let star = null, best = COMMENT_STAR_MIN - 1;
  list.forEach((c) => {
    const score = c.likes + c.dislikes + c.replies.length;
    if (score > best) { best = score; star = c; }
  });
  list.forEach((c) => { c.star = c === star; });
  return star ? [star, ...list.filter((c) => c !== star)] : list;
}

function commentTime(iso) {
  const at = Date.parse(iso);
  if (isNaN(at)) return "";
  const minutes = Math.floor(Math.max(0, Date.now() - at) / 60000);
  if (minutes < 1) return "आत्ताच";
  if (minutes < 60) return minutes === 1 ? "१ मिनिटापूर्वी" : `${toDevanagari(minutes)} मिनिटांपूर्वी`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "१ तासापूर्वी" : `${toDevanagari(hours)} तासांपूर्वी`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? "१ दिवसापूर्वी" : `${toDevanagari(days)} दिवसांपूर्वी`;
  const when = new Date(at);
  return `${toDevanagari(when.getDate())} ${COMMENT_MONTHS[when.getMonth()]} ${toDevanagari(when.getFullYear())}`;
}

// one of six soft colours, always the same for the same name
function commentColor(name) {
  let sum = 0;
  for (const ch of String(name)) sum = (sum * 31 + ch.codePointAt(0)) >>> 0;
  return sum % 6;
}

function commentIdentityHTML() {
  return commentUser
    ? `<div class="cm-as"><span class="cm-as-label">प्रतिक्रिया देणारे:</span> <strong data-no-i18n>${escText(commentUser.name)}</strong> <button type="button" class="cm-signout" data-act="signout">बाहेर पडा</button></div>`
    : `<div class="cm-as"><span class="cm-as-label">प्रतिक्रिया पोस्ट करताना साइन इन करावे लागेल.</span></div>`;
}

function paintCommentIdentity() {
  document.querySelectorAll("#comments-section .cm-as").forEach((row) => { row.outerHTML = commentIdentityHTML(); });
}

function commentFormHTML(parentId, prefill, withCancel) {
  return `
    <form class="cm-form" data-parent="${parentId || ""}" novalidate>
      ${commentIdentityHTML()}
      <textarea name="body" class="comment-textarea-input cm-body-input" maxlength="${COMMENT_MAX}" rows="${parentId ? 3 : 4}" placeholder="तुमची प्रतिक्रिया लिहा…" aria-label="तुमची प्रतिक्रिया">${escText(prefill || "")}</textarea>
      <input type="text" name="website" class="cm-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <p class="cm-form-error" role="alert" hidden></p>
      <div class="cm-form-row">
        <span class="cm-counter">${toDevanagari((prefill || "").length)}/${toDevanagari(COMMENT_MAX)}</span>
        ${withCancel ? `<button type="button" class="cm-cancel" data-act="cancel">रद्द करा</button>` : ""}
        <button type="submit" class="btn-submit-comment">${parentId ? "उत्तर पोस्ट करा" : "प्रतिक्रिया पोस्ट करा"}</button>
      </div>
    </form>`;
}

// one comment (a reply has no thread of its own: it sits inside the thread of its top-level comment)
function commentHTML(c, state, isReply) {
  const opened = isReply ? 0 : state.open[c.id] || 0;
  const mine = c.my_vote;
  const first = [...String(c.name).trim()][0] || "?";
  const count = isReply ? 0 : c.replies.length;
  const hidden = count - opened;
  return `
    <article class="cm-item${isReply ? " cm-reply" : ""}" id="comment-${c.id}" data-id="${c.id}">
      <header class="cm-head">
        <span class="cm-avatar cm-av-${commentColor(c.name)}" aria-hidden="true" data-no-i18n>${escText(first.toUpperCase())}</span>
        <div class="cm-who">
          <div class="cm-name-row">
            <span class="cm-name" data-no-i18n>${escText(c.name)}</span>
            ${c.star ? `<span class="cm-badge">सर्वाधिक प्रतिसाद</span>` : ""}
          </div>
          <time class="cm-time" datetime="${escText(c.created_at)}">${commentTime(c.created_at)}</time>
        </div>
        <div class="cm-menu">
          <button type="button" class="cm-menu-btn" data-act="menu" aria-label="पर्याय" aria-haspopup="true" aria-expanded="false"><i class="fa-solid fa-ellipsis"></i></button>
          <div class="cm-menu-list" role="menu" hidden><button type="button" role="menuitem" data-act="report">तक्रार करा</button></div>
        </div>
      </header>
      <p class="cm-text" data-no-i18n>${escText(c.body)}</p>
      <div class="cm-actions">
        ${!isReply && count ? `<button type="button" class="cm-replies-btn" data-act="replies" aria-expanded="${opened > 0}">${count === 1 ? "१ उत्तर" : `${toDevanagari(count)} उत्तरे`} <i class="fa-solid fa-chevron-${opened ? "up" : "down"}"></i></button>` : "<span></span>"}
        <div class="cm-actions-right">
          <button type="button" class="cm-vote cm-like${mine === 1 ? " on" : ""}" data-act="like" aria-pressed="${mine === 1}" aria-label="आवडले"><i class="fa-${mine === 1 ? "solid" : "regular"} fa-thumbs-up"></i><span>${toDevanagari(c.likes)}</span></button>
          <button type="button" class="cm-vote cm-dislike${mine === -1 ? " on" : ""}" data-act="dislike" aria-pressed="${mine === -1}" aria-label="आवडले नाही"><i class="fa-${mine === -1 ? "solid" : "regular"} fa-thumbs-down"></i><span>${toDevanagari(c.dislikes)}</span></button>
          <button type="button" class="cm-reply-btn" data-act="reply">उत्तर द्या</button>
        </div>
      </div>
      <div class="cm-slot"></div>
      ${opened ? `
      <div class="cm-replies">
        ${c.replies.slice(0, opened).map((r) => commentHTML(r, state, true)).join("")}
        ${hidden > 0 ? `<button type="button" class="cm-showmore" data-act="morereplies">${hidden === 1 ? "आणखी १ उत्तर पहा" : `आणखी ${toDevanagari(hidden)} उत्तरे पहा`} <i class="fa-solid fa-chevron-down"></i></button>` : ""}
      </div>` : ""}
    </article>`;
}

function commentListHTML(state) {
  if (state.status === "loading") return `<p class="cm-note">प्रतिक्रिया लोड होत आहेत…</p>`;
  if (state.status === "error") {
    return `<div class="cm-note"><p>प्रतिक्रिया लोड करता आल्या नाहीत.</p><button type="button" class="cm-retry" data-act="retry">पुन्हा प्रयत्न करा</button></div>`;
  }
  if (!state.comments.length) return `<p class="cm-note">पहिली प्रतिक्रिया तुमची असू द्या</p>`;
  return state.comments.slice(0, state.shown).map((c) => commentHTML(c, state, false)).join("");
}

const commentHeadingText = (state) => `प्रतिक्रिया (${toDevanagari(state.total)})`;
const commentMoreVisible = (state) => state.status === "ready" && state.shown < state.comments.length;

// the whole section (a first draw, after a language switch, after loading); what was typed in the top form stays
function paintComments() {
  const state = commentCurrent;
  const section = document.getElementById("comments-section");
  if (!state || !section) return;
  const old = section.querySelector(".cm-form[data-parent='']");
  if (old) state.draft = { body: old.elements.body.value };
  section.innerHTML = `
    <h3 class="comments-heading" id="comments-title"><i class="fa-regular fa-comments"></i> <span class="cm-heading-text">${commentHeadingText(state)}</span></h3>
    ${commentFormHTML(null, "", false)}
    <div class="cm-list" id="comments-list" aria-live="polite">${commentListHTML(state)}</div>
    <button type="button" class="cm-loadmore" data-act="more"${commentMoreVisible(state) ? "" : " hidden"}>आणखी प्रतिक्रिया पहा</button>`;
  if (state.draft) {
    const form = section.querySelector(".cm-form");
    form.elements.body.value = state.draft.body;
    form.querySelector(".cm-counter").textContent = `${toDevanagari(state.draft.body.length)}/${toDevanagari(COMMENT_MAX)}`;
  }
}

function paintCommentHeading() {
  const heading = document.querySelector("#comments-section .cm-heading-text");
  if (heading && commentCurrent) heading.textContent = commentHeadingText(commentCurrent);
}

// a comment drawn again (its thread opened / closed, a reply added): the reply forms open inside it stay, with what was typed
function refreshComment(c) {
  const card = document.getElementById(`comment-${c.id}`);
  if (!card || !commentCurrent) return;
  const kept = [...card.querySelectorAll(".cm-slot > form")].map((form) => [form.closest(".cm-item").dataset.id, form]);
  card.outerHTML = commentHTML(c, commentCurrent, c.parent_id !== null);
  kept.forEach(([id, form]) => {
    const slot = document.querySelector(`#comment-${id} > .cm-slot`);
    if (slot) slot.append(form);
  });
}

// only the two vote buttons of a comment change when somebody votes (nothing else of the page is touched)
function paintVotes(c) {
  const bar = document.querySelector(`#comment-${c.id} > .cm-actions`);
  if (!bar) return;
  [["like", 1, c.likes, "up"], ["dislike", -1, c.dislikes, "down"]].forEach(([act, value, count, hand]) => {
    const button = bar.querySelector(`[data-act="${act}"]`);
    const on = c.my_vote === value;
    button.classList.toggle("on", on);
    button.setAttribute("aria-pressed", String(on));
    button.firstElementChild.className = `fa-${on ? "solid" : "regular"} fa-thumbs-${hand}`;
    button.lastElementChild.textContent = toDevanagari(count);
  });
}

async function loadComments(state) {
  state.status = "loading";
  if (state === commentCurrent) paintComments();
  try {
    const data = await commentApi(`comments?type=${state.type}&id=${state.id}&visitor=${encodeURIComponent(commentVisitor())}`);
    state.comments = commentOrder(data.comments.map((c) => ({ ...c, replies: c.replies || [] })));
    state.total = data.total;
    state.shown = COMMENT_PAGE;
    state.open = {};
    state.status = "ready";
    state.loadedAt = Date.now();
  } catch (e) {
    state.status = "error";
  }
  if (state === commentCurrent) paintComments();
}

// called whenever a news / blog / weekly issue is drawn
function initComments(article) {
  const item = commentItemOf(article);
  const key = `${item.type}:${item.id}`;
  const state = commentLists[key] || (commentLists[key] = { ...item, status: "loading", total: 0, comments: [], shown: COMMENT_PAGE, open: {}, loadedAt: 0, draft: null });
  commentCurrent = state;
  loadLoginOptions();
  paintComments();
  if (state.status !== "ready" || Date.now() - state.loadedAt > COMMENT_FRESH_MS) loadComments(state);
}

function commentFormError(form, kind) {
  const box = form.querySelector(".cm-form-error");
  box.textContent = COMMENT_ERRORS[kind] || COMMENT_ERRORS.server;
  box.hidden = false;
}

async function submitComment(form) {
  const state = commentCurrent;
  if (!state) return;
  const parentId = Number(form.dataset.parent) || null;
  const text = form.elements.body.value.trim();
  if (!text || text.length > COMMENT_MAX) return commentFormError(form, "invalid");
  if (!commentUser) {                                              // not signed in: the dialog opens, and this same form posts once the reader is in
    form.querySelector(".cm-form-error").hidden = true;
    return openCommentLogin(() => { if (form.isConnected) submitComment(form); });
  }
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  form.querySelector(".cm-form-error").hidden = true;
  try {
    const data = await commentApi("comments", { type: state.type, id: state.id, parent_id: parentId, token: commentUser.token, body: text, website: form.elements.website.value });
    const posted = { ...data.comment, replies: data.comment.replies || [] };
    state.total += 1;
    if (parentId) {
      const top = commentFind(state, parentId);
      if (top) {
        top.replies.push(posted);
        state.open[top.id] = top.replies.length;               // its thread opens and shows the new reply
        if (state === commentCurrent) refreshComment(top);
      }
    } else {
      state.comments.unshift(posted);
      state.draft = null;
      if (state === commentCurrent) {
        const list = document.getElementById("comments-list");
        if (!list.querySelector(".cm-item")) list.innerHTML = "";
        list.insertAdjacentHTML("afterbegin", commentHTML(posted, state, false));
        form.elements.body.value = "";
        form.querySelector(".cm-counter").textContent = `०/${toDevanagari(COMMENT_MAX)}`;
        document.querySelector("#comments-section .cm-loadmore").hidden = !commentMoreVisible(state);
      }
    }
    if (state === commentCurrent) paintCommentHeading();
    if (parentId) form.remove();
  } catch (e) {
    if (e.kind === "login") {                                      // the sign-in is no longer good (it ran out): sign in again, then post
      commentSetUser(null);
      openCommentLogin(() => { if (form.isConnected) submitComment(form); });
    } else {
      commentFormError(form, e.kind);
    }
  } finally {
    button.disabled = false;
  }
}

async function voteOnComment(c, vote) {
  if (c.busy) return;
  const before = { likes: c.likes, dislikes: c.dislikes, my_vote: c.my_vote };
  const next = c.my_vote === vote ? 0 : vote;                   // the same button again takes the vote back
  c.likes += (next === 1) - (c.my_vote === 1);
  c.dislikes += (next === -1) - (c.my_vote === -1);
  c.my_vote = next;
  c.busy = true;
  paintVotes(c);
  try {
    const answer = await commentApi(`comments/${c.id}/vote`, { vote: next });
    Object.assign(c, { likes: answer.likes, dislikes: answer.dislikes, my_vote: answer.my_vote });
  } catch (e) {
    Object.assign(c, before);
    showToast(COMMENT_ERRORS[e.kind] || COMMENT_ERRORS.server);
  }
  c.busy = false;
  paintVotes(c);
}

async function reportComment(c) {
  try {
    await commentApi(`comments/${c.id}/report`, {});
    showToast("धन्यवाद — आम्ही ही प्रतिक्रिया तपासू");
  } catch (e) {
    showToast(COMMENT_ERRORS[e.kind] || COMMENT_ERRORS.server);
  }
}

function closeCommentMenus(except) {
  document.querySelectorAll("#comments-section .cm-menu-list:not([hidden])").forEach((menu) => {
    if (menu === except) return;
    menu.hidden = true;
    menu.parentElement.querySelector(".cm-menu-btn").setAttribute("aria-expanded", "false");
  });
}

function onCommentClick(e) {
  const button = e.target.closest("[data-act]");
  const state = commentCurrent;
  if (!button || !state) return;
  const act = button.dataset.act;
  const card = button.closest(".cm-item");
  const c = card ? commentFind(state, Number(card.dataset.id)) : null;
  if (act === "menu") {
    const menu = button.parentElement.querySelector(".cm-menu-list");
    closeCommentMenus(menu);
    menu.hidden = !menu.hidden;
    button.setAttribute("aria-expanded", String(!menu.hidden));
  } else if (act === "report" && c) {
    closeCommentMenus();
    reportComment(c);
  } else if ((act === "like" || act === "dislike") && c) {
    voteOnComment(c, act === "like" ? 1 : -1);
  } else if (act === "replies" && c) {
    state.open[c.id] = state.open[c.id] ? 0 : Math.min(REPLY_PAGE, c.replies.length);
    refreshComment(c);
  } else if (act === "morereplies" && c) {
    state.open[c.id] = c.replies.length;
    refreshComment(c);
  } else if (act === "reply" && c) {
    const slot = card.querySelector(":scope > .cm-slot");
    if (!slot.firstElementChild) slot.innerHTML = commentFormHTML(c.parent_id || c.id, `@${c.name} `, true);
    const box = slot.querySelector("textarea");
    box.focus();
    box.setSelectionRange(box.value.length, box.value.length);
  } else if (act === "signout") {
    commentSetUser(null);
  } else if (act === "cancel") {
    button.closest(".cm-form").remove();
  } else if (act === "more") {
    state.shown += COMMENT_PAGE;
    document.getElementById("comments-list").innerHTML = commentListHTML(state);
    button.hidden = !commentMoreVisible(state);
  } else if (act === "retry") {
    loadComments(state);
  }
}

function initCommentEvents() {
  const section = () => document.getElementById("comments-section");
  document.addEventListener("click", (e) => {
    const box = section();
    if (!box || !box.contains(e.target)) return closeCommentMenus();
    if (!e.target.closest(".cm-menu")) closeCommentMenus();
    onCommentClick(e);
  });
  document.addEventListener("submit", (e) => {
    if (!e.target.classList.contains("cm-form")) return;
    e.preventDefault();
    submitComment(e.target);
  });
  document.addEventListener("input", (e) => {
    if (!e.target.classList.contains("cm-body-input")) return;
    e.target.closest(".cm-form").querySelector(".cm-counter").textContent = `${toDevanagari(e.target.value.length)}/${toDevanagari(COMMENT_MAX)}`;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = document.querySelector("#comments-section .cm-menu-list:not([hidden])");
    if (!open) return;
    open.parentElement.querySelector(".cm-menu-btn").focus();
    closeCommentMenus();
  });
}

// ---- the "Post Your Comment" dialog: Google, a code mailed to the reader, or name + e-mail + a small sum ----
let commentLoginAfter = null;        // what to do once the reader is in (post the comment that was waiting)
let commentLoginFocus = null;        // where the focus goes back to
let commentLoginEmail = "";          // the address a code was sent to
let commentLoginMail = false;        // does this server offer the e-mailed code
let commentSum = "";                 // the token of the sum on show
let commentOptionsPromise = null;
let commentGoogleScript = null;

// which ways of signing in this server offers (asked once)
function loadLoginOptions() {
  if (!commentOptionsPromise) {
    commentOptionsPromise = commentApi("commenters/options")
      .then((d) => ({ google_client_id: d.google_client_id || "", email: !!d.email }))
      .catch(() => { commentOptionsPromise = null; return { google_client_id: "", email: false }; });
  }
  return commentOptionsPromise;
}

const commentLoginModal = () => document.getElementById("cm-modal");

function commentLoginHTML() {
  return `
    <div class="cm-modal-backdrop" data-act="login-close"></div>
    <div class="cm-modal-card">
      <div class="cm-modal-head">
        <h3 id="cm-modal-title">तुमची प्रतिक्रिया पोस्ट करा</h3>
        <button type="button" class="cm-modal-close" data-act="login-close" aria-label="बंद करा"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <section class="cm-signin" id="cm-signin" hidden>
        <h4>प्रतिक्रिया पोस्ट करण्यासाठी साइन इन करा:</h4>
        <div class="cm-google" id="cm-google" hidden></div>
        <p class="cm-error" id="cm-google-error" role="alert" hidden></p>
        <form class="cm-login-form" data-form="email-start" novalidate hidden>
          <div class="cm-email-row">
            <input type="email" name="email" maxlength="190" autocomplete="email" placeholder="ईमेल आयडी" aria-label="ईमेल आयडी" />
            <button type="submit" class="cm-arrow" aria-label="कोड पाठवा"><i class="fa-solid fa-arrow-right"></i></button>
          </div>
          <p class="cm-error" role="alert" hidden></p>
        </form>
        <form class="cm-login-form" data-form="email-verify" novalidate hidden>
          <p class="cm-sent"><span>तुमच्या ईमेलवर ६ अंकी कोड पाठवला आहे:</span> <strong id="cm-sent-to" data-no-i18n></strong></p>
          <input type="text" name="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="६ अंकी कोड" aria-label="६ अंकी कोड" />
          <input type="text" name="name" maxlength="${COMMENT_NAME_MAX}" autocomplete="name" placeholder="तुमचे नाव (ऐच्छिक)" aria-label="तुमचे नाव (ऐच्छिक)" />
          <p class="cm-error" role="alert" hidden></p>
          <div class="cm-login-row">
            <button type="button" class="cm-link" data-act="email-back">ईमेल बदला</button>
            <button type="submit" class="btn-submit-comment">साइन इन करा</button>
          </div>
        </form>
      </section>
      <div class="cm-or" id="cm-or" hidden><span>किंवा</span></div>
      <section class="cm-guest">
        <h4>साइन इन न करता सुरू ठेवा</h4>
        <form class="cm-login-form" data-form="guest" novalidate>
          <input type="text" name="name" maxlength="${COMMENT_NAME_MAX}" autocomplete="name" placeholder="तुमचे पूर्ण नाव" aria-label="तुमचे पूर्ण नाव" />
          <input type="email" name="email" maxlength="190" autocomplete="email" placeholder="तुमचा ईमेल आयडी" aria-label="तुमचा ईमेल आयडी" />
          <input type="tel" name="mobile" inputmode="numeric" maxlength="16" autocomplete="tel" placeholder="तुमचा मोबाईल नंबर" aria-label="तुमचा मोबाईल नंबर" />
          <input type="text" name="website" class="cm-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <div class="cm-sum">
            <span class="cm-sum-q" id="cm-sum-q">…</span>
            <input type="text" name="answer" inputmode="numeric" maxlength="3" autocomplete="off" placeholder="येथे उत्तर लिहा" aria-label="येथे उत्तर लिहा" />
          </div>
          <p class="cm-error" role="alert" hidden></p>
          <button type="submit" class="btn-submit-comment cm-wide">प्रतिक्रिया पोस्ट करा</button>
        </form>
      </section>
    </div>`;
}

const loginFormClear = (form) => { form.querySelector(".cm-error").hidden = true; };
function loginFormError(form, kind) {
  const box = form.querySelector(".cm-error");
  box.textContent = COMMENT_ERRORS[kind] || COMMENT_ERRORS.server;
  box.hidden = false;
}

// the e-mail part has two steps: the address, then the code that was mailed to it
function showLoginStep(step, devCode) {
  const modal = commentLoginModal();
  if (!modal) return;
  modal.querySelector('[data-form="email-start"]').hidden = !(commentLoginMail && step === "start");
  const verify = modal.querySelector('[data-form="email-verify"]');
  verify.hidden = step !== "code";
  if (step === "code") {
    modal.querySelector("#cm-sent-to").textContent = commentLoginEmail;
    verify.elements.code.value = devCode || "";                       // (only a development PC without a mail server hands the code back)
    verify.elements.code.focus();
  }
}

async function loadCommentSum() {
  const question = document.getElementById("cm-sum-q");
  try {
    const data = await commentApi("commenters/captcha");
    commentSum = data.token;
    if (question) question.textContent = `कॅप्चा: ${data.question}`;
  } catch (e) {
    commentSum = "";
    if (question) question.textContent = "…";
  }
}

function loadGoogleScript() {
  if (window.google && window.google.accounts) return Promise.resolve();
  if (!commentGoogleScript) {
    commentGoogleScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => { commentGoogleScript = null; reject(new Error("google")); };
      document.head.appendChild(script);
    });
  }
  return commentGoogleScript;
}

async function showGoogleButton(clientId) {
  const holder = document.getElementById("cm-google");
  try { await loadGoogleScript(); } catch (e) { return; }           // blocked or offline: the other ways stay
  if (!holder || !holder.isConnected) return;
  window.google.accounts.id.initialize({ client_id: clientId, callback: onGoogleCredential });
  holder.hidden = false;
  holder.innerHTML = "";
  window.google.accounts.id.renderButton(holder, { theme: "outline", size: "large", text: "signin_with", width: Math.min(360, holder.clientWidth || 320), locale: getLang() === "en" ? "en" : "mr" });
}

function commentSignedIn(data) {
  commentSetUser({ token: data.token, name: data.user.name, email: data.user.email, provider: data.user.provider });
  const after = commentLoginAfter;
  closeCommentLogin();
  if (after) after();
}

async function onGoogleCredential(response) {
  const box = document.getElementById("cm-google-error");
  if (box) box.hidden = true;
  try {
    commentSignedIn(await commentApi("commenters/google", { credential: response.credential }));
  } catch (e) {
    if (box) { box.textContent = COMMENT_ERRORS[e.kind] || COMMENT_ERRORS.server; box.hidden = false; }
  }
}

async function openCommentLogin(after) {
  commentLoginAfter = after || null;
  commentLoginFocus = document.activeElement;
  let modal = commentLoginModal();
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "cm-modal";
    modal.className = "cm-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "cm-modal-title");
    modal.addEventListener("click", onLoginClick);
    modal.addEventListener("submit", onLoginSubmit);
    modal.addEventListener("keydown", onLoginKey);
    document.body.appendChild(modal);
  }
  modal.innerHTML = commentLoginHTML();                              // drawn fresh each time: in the language of the moment, nothing typed before
  modal.hidden = false;
  document.documentElement.classList.add("cm-modal-open");
  loadCommentSum();
  const options = await loadLoginOptions();
  if (modal.hidden) return;
  commentLoginMail = options.email;
  const signin = modal.querySelector("#cm-signin");
  signin.hidden = !(options.email || options.google_client_id);
  modal.querySelector("#cm-or").hidden = signin.hidden;
  showLoginStep("start");
  if (options.google_client_id) showGoogleButton(options.google_client_id);
  const first = modal.querySelector(".cm-signin:not([hidden]) input, .cm-guest input");
  if (first) first.focus();
}

function closeCommentLogin() {
  const modal = commentLoginModal();
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  modal.innerHTML = "";
  commentLoginAfter = null;
  document.documentElement.classList.remove("cm-modal-open");
  if (commentLoginFocus && commentLoginFocus.isConnected) commentLoginFocus.focus();
}

function onLoginClick(e) {
  const button = e.target.closest("[data-act]");
  if (!button) return;
  if (button.dataset.act === "login-close") closeCommentLogin();
  else if (button.dataset.act === "email-back") showLoginStep("start");
}

function onLoginKey(e) {
  if (e.key === "Escape") {
    e.stopPropagation();
    closeCommentLogin();
  } else if (e.key === "Tab") {                                      // the focus stays inside the dialog
    const nodes = [...commentLoginModal().querySelectorAll("button, input, a[href]")].filter((n) => !n.disabled && n.tabIndex >= 0 && n.offsetParent !== null);
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}

async function onLoginSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const which = form.dataset.form;
  const button = form.querySelector("button[type=submit]");
  const looksLikeEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  const looksLikeMobile = (s) => {                                 // 10 digits, the first 6-9; spaces, Devanagari digits, +91 / 91 / 0 in front are fine
    let d = s.replace(/[०-९]/g, (c) => "०१२३४५६७८९".indexOf(c)).replace(/[\s\-().]/g, "").replace(/^(\+91|0091)/, "");
    if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
    if (d.length === 11 && d[0] === "0") d = d.slice(1);
    return /^[6-9][0-9]{9}$/.test(d);
  };
  loginFormClear(form);
  if (which === "email-start") {
    const email = form.elements.email.value.trim();
    if (!looksLikeEmail(email)) return loginFormError(form, "email");
    button.disabled = true;
    try {
      const data = await commentApi("commenters/email/start", { email });
      commentLoginEmail = email;
      showLoginStep("code", data.dev_code);
    } catch (err) {
      loginFormError(form, err.kind);
    }
    button.disabled = false;
  } else if (which === "email-verify") {
    const code = form.elements.code.value.trim();
    if (!/^\d{6}$/.test(code)) return loginFormError(form, "code");
    button.disabled = true;
    try {
      commentSignedIn(await commentApi("commenters/email/verify", { email: commentLoginEmail, code, name: form.elements.name.value.trim() }));
    } catch (err) {
      loginFormError(form, err.kind);
      button.disabled = false;
    }
  } else if (which === "guest") {
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const mobile = form.elements.mobile.value.trim();
    const answer = form.elements.answer.value.trim();
    if (!name) return loginFormError(form, "name");
    if (!looksLikeEmail(email)) return loginFormError(form, "email");
    if (!looksLikeMobile(mobile)) return loginFormError(form, "mobile");
    if (!answer || !commentSum) return loginFormError(form, "captcha");
    button.disabled = true;
    try {
      commentSignedIn(await commentApi("commenters/guest", { name, email, mobile, captcha_token: commentSum, captcha_answer: answer, website: form.elements.website.value }));
    } catch (err) {
      loginFormError(form, err.kind);
      if (err.kind === "captcha") { form.elements.answer.value = ""; loadCommentSum(); }
      button.disabled = false;
    }
  }
}

// --- One article / one weekly issue on its own page (center column) ---
function renderArticleView(article) {
  currentView = "article";
  currentArticleId = article.id;

  const container = document.getElementById("main-content-container");
  if (!container) return;

  const isIssue = article.category === "weekly" && !!article.issue;
  const pageUrl = shareUrlFor(article);
  const sectionOnclick = `setCategoryFilter('${article.category}')`;

  // previous / next: by DATE for weekly issues, inside the same section for everything else
  let prevItem, nextItem, prevText, nextText;
  if (isIssue) {
    const byDate = weeklyIssues();                           // newest first
    const at = byDate.findIndex((a) => a.id === article.id);
    prevItem = at >= 0 ? byDate[at + 1] || null : null;      // the issue of the week before
    nextItem = at > 0 ? byDate[at - 1] : null;               // the issue of the week after
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

  // related: other issues for an issue; for an article the ones that share tags first, then the same section, then other news
  const related = isIssue
    ? weeklyIssues().filter((a) => a.id !== article.id).slice(0, 6)
    : [
        ...articlesData.filter((a) => a.id !== article.id && a.category === article.category),
        ...articlesData.filter((a) => a.id !== article.id && a.category !== article.category && NEWS_CATEGORIES.includes(a.category)),
        ...articlesData.filter((a) => a.id !== article.id && a.category !== "weekly" && !NEWS_CATEGORIES.includes(a.category) && a.category !== article.category),
      ].sort((a, b) => sharedTags(article, b) - sharedTags(article, a)).slice(0, 3);      // (the sort keeps the order of the ones that share as many)

  const pdf = isIssue ? pdfUrlFor(article) : "";

  container.className = "main-content-box view-article" + (isIssue ? " view-issue" : "");
  container.innerHTML = `
    <!-- Breadcrumb: Home > section > this page. Every part is a link that does what it says. -->
    <div class="breadcrumb-bar" id="main-breadcrumb">
      <a href="./" data-route="" onclick="returnToHomeFeed()">Home</a>
      <i class="fa-solid fa-chevron-right"></i>
      <a href="${hrefForKey(routeForCategory(article.category))}" data-route="${routeForCategory(article.category)}" onclick="${sectionOnclick}">${isIssue ? "साप्ताहिक आवृत्ती" : article.categoryLabel}</a>
      <i class="fa-solid fa-chevron-right crumb-sep-title"></i>
      <span class="crumb-title">${isIssue ? (issueLabel(article) || article.title) : article.title}</span>
    </div>

    <h1 class="single-post-headline">
      ${article.title}
    </h1>
    ${headlineDateHTML(article)}

    ${isIssue && WEEKLY_PDF ? `
    <!-- The weekly issue: cover + PDF e-paper -->
    <div class="issue-pdf-card">
      <div class="issue-pdf-cover" onclick="openWeeklyModal(${article.id})" role="button" tabindex="0" aria-label="PDF ई-पेपर वाचा"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openWeeklyModal(${article.id});}">
        ${fluidImg(article.image, issueLabel(article) + " — " + article.title, [480, 800, 1200], "(max-width: 980px) 100vw, 700px", HERO_IMG_ATTRS)}
      </div>
      <div class="issue-pdf-info">
        <h2 class="issue-pdf-title">ई-पेपर (PDF) — मोफत वाचा व डाउनलोड करा</h2>
        <p class="issue-pdf-meta">${article.date} • लोकमंगल साप्ताहिक</p>
        <div class="issue-pdf-actions" data-pdf-url="${pdf}">
          <button class="btn-pdf-read" data-pdf-action onclick="openWeeklyModal(${article.id})"><i class="fa-solid fa-book-open"></i> PDF ऑनलाईन वाचा</button>
          <a class="btn-pdf-dl" data-pdf-action ${pdfLinkAttrs(pdf, article.issue)}><i class="fa-solid fa-download"></i> PDF डाउनलोड<span class="pdf-size"></span></a>
          <a class="btn-pdf-open" data-pdf-action href="${pdf}" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> नवीन टॅब</a>
          <p class="pdf-missing-note" hidden><i class="fa-regular fa-clock"></i> या अंकाचा PDF लवकरच उपलब्ध होईल.</p>
        </div>
      </div>
    </div>
    ` : `
    <div class="single-post-media">
      ${fluidImg(article.image, article.title, [480, 800, 1200], "(max-width: 980px) 100vw, 700px", HERO_IMG_ATTRS)}
    </div>
    `}

    <div class="single-article-content">
      <p style="font-weight:600; font-size:16px; line-height:1.75; color:var(--title-color)">
        ${inlineHTML(article.excerpt)}
      </p>
      ${article.content}
      <blockquote>
        "सत्य आणि निःपक्षपाती पत्रकारिता हाच लोकशाहीचा खरा आधारस्तंभ आहे. लोकमंगल न्यूज पोर्टल वाचकांच्या प्रत्येक विश्वासास पात्र ठरण्यासाठी कटिबद्ध आहे."
      </blockquote>
      <p>
        या संदर्भातील पुढील ताज्या घडामोडी आणि विशेष विश्लेषणासाठी लोकमंगल न्यूज पोर्टलशी जोडलेले राहा. आपल्या परिसरातील बातम्या आमच्या प्रतिनिधींना कळवा.
      </p>
    </div>
    ${isIssue ? "" : articleTagsHTML(article)}

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
        <i class="fa-brands fa-x-twitter"></i> X
      </a>
      <button class="social-icon-box cp share-btn" onclick="navigator.clipboard?.writeText('${pageUrl}'); showToast('${isIssue ? "अंकाची" : "बातमी"} लिंक कॉपी केली!')">
        <i class="fa-solid fa-link"></i> कॉपी लिंक
      </button>
    </div>

    <!-- Previous / Next (issue number for issues, same section for articles) -->
    <div class="post-navigation-row">
      ${prevItem ? `
        <div class="post-nav-item prev" onclick="openArticlePage(${prevItem.id})">
          <span class="nav-dir"><i class="fa-solid fa-arrow-left"></i> ${prevText}${prevItem.issue && issueLabel(prevItem) ? " (" + issueLabel(prevItem) + ")" : ""}</span>
          <span class="nav-title">${titleLink(prevItem)}</span>
        </div>
      ` : `<div></div>`}
      ${nextItem ? `
        <div class="post-nav-item next" onclick="openArticlePage(${nextItem.id})">
          <span class="nav-dir">${nextText}${nextItem.issue && issueLabel(nextItem) ? " (" + issueLabel(nextItem) + ")" : ""} <i class="fa-solid fa-arrow-right"></i></span>
          <span class="nav-title">${titleLink(nextItem)}</span>
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
          <h4 class="related-post-title">${titleLink(rel)}</h4>
        </div>
      `).join("")}
    </div>
    ${isIssue ? `
    <div class="issue-all-link">
      <button class="btn-archive-pill" onclick="setCategoryFilter('weekly')"><i class="fa-solid fa-layer-group" style="color:var(--accent-red)"></i> सर्व ${toDevanagari(weeklyIssues().length)} अंक${WEEKLY_PDF ? " व PDF" : ""} पहा</button>
    </div>` : ""}

    <!-- Comments (initComments fills it in) -->
    <section class="comments-section-wrap" id="comments-section" aria-labelledby="comments-title"></section>

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
  hydratePdfInfo(container);
  initComments(article);
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
//
// Built for BIG issue files (10 MB and more):
//  - range-only reading: only the parts of the file needed for the pages on screen are requested. (pdf.js'
//    default "stream the whole file in the background" pulled ~7 MB while only page 1 was being read.)
//  - a real progress bar with MB; pages are drawn when they come near the screen and freed when far away
//  - zoom 100 - 300 %: pages are redrawn SHARP at the new size, not just stretched
// ---------------------------------------------------------------------------------------------------
const PDFJS_BASE = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
const PDFJS_SRI = "sha512-q+4liFwdPC/bNdhUpZx6aXDx/h77yEQtn4I1slHydcbZK34nLaR3cAeYSJshoxIOq3mjEf7xJE8YWIUHMn+oCQ==";
const PDF_OPEN_OPTIONS = {
  disableAutoFetch: true,   // don't pre-download pages nobody looked at ...
  disableStream: true,      // ... (pdf.js needs BOTH switches for that). Needs a host with HTTP Range support: Vercel, R2, S3 all have it
  isEvalSupported: false,   // never run code that is embedded inside a PDF
};
const READER_ZOOMS = [1, 1.5, 2, 3];
const READER_MAX_PIXELS = 6e6;     // one page canvas never gets bigger than ~6 megapixels (phone memory)
let pdfjsPromise = null;
let readerRun = 0;                 // bumps on every open / close, so stale async work stops by itself
let readerUrl = "";
let readerTask = null;
let readerDoc = null;
let readerPageObserver = null;
let readerResizeObserver = null;
let readerScrollHandler = null;
let readerZoomIdx = 0;
const readerRenders = new Set();   // page drawings in progress (cancelled when the reader closes)
let readerQueue = [];              // pages waiting to be drawn (drawn one by one, the one nearest to the middle of the screen first)
let readerDrawing = false;
let readerSlowTimer = 0;

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

function setReaderSize(bytes) {
  const el = document.getElementById("reader-size");
  if (el) el.textContent = bytes ? fmtSize(bytes) : "";
}

function showReaderLoading(url) {
  readerMessage(`<i class="fa-solid fa-spinner fa-spin reader-spin"></i>
    <span>PDF लोड होत आहे…</span>
    <div class="reader-progress indeterminate" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i id="reader-bar"></i></div>
    <small id="reader-load-sub"></small>
    <div class="reader-slow" id="reader-slow" hidden>
      <span>कनेक्शन हळू आहे — थोडा वेळ लागू शकतो.</span>
      <div class="reader-fallback">
        <a class="btn-reader" href="${url}" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> नवीन टॅबमध्ये उघडा</a>
        <a class="btn-reader" href="${url}" download><i class="fa-solid fa-download"></i> डाउनलोड</a>
      </div>
    </div>`);
  // still no document after 15 s (slow network, or the PDF library is slow to arrive): offer the other ways to read it
  clearTimeout(readerSlowTimer);
  const run = readerRun;
  readerSlowTimer = setTimeout(() => {
    const box = document.getElementById("reader-slow");
    if (box && run === readerRun && !readerDoc) box.hidden = false;
  }, 15000);
}

function updateReaderProgress(loaded, total) {
  if (!total) return;
  const bar = document.getElementById("reader-bar");
  if (bar) {
    const box = bar.parentElement;
    const pct = Math.max(1, Math.min(100, Math.round((loaded / total) * 100)));
    box.classList.remove("indeterminate");
    box.setAttribute("aria-valuenow", String(pct));
    bar.style.width = pct + "%";
  }
  const sub = document.getElementById("reader-load-sub");
  if (sub) sub.textContent = `${fmtSize(loaded)} / ${fmtSize(total)}`;
  setReaderSize(total);
}

// forget everything about the PDF that was open (frees the page canvases and stops any download too)
function resetReader() {
  readerRun++;
  clearTimeout(readerSlowTimer);
  if (readerPageObserver) { readerPageObserver.disconnect(); readerPageObserver = null; }
  if (readerResizeObserver) { readerResizeObserver.disconnect(); readerResizeObserver = null; }
  const { body, pages, status, ind } = readerParts();
  if (body && readerScrollHandler) { body.removeEventListener("scroll", readerScrollHandler); readerScrollHandler = null; }
  readerRenders.forEach((t) => { try { t.cancel(); } catch (e) { /* already finished */ } });
  readerRenders.clear();
  readerQueue = [];
  if (readerTask) { Promise.resolve(readerTask.destroy()).catch(() => {}); }   // aborts a download that is still running
  readerTask = null;
  readerDoc = null;
  if (pages) pages.innerHTML = "";
  if (status) { status.hidden = true; status.innerHTML = ""; }
  if (ind) ind.textContent = "";
}

function showReaderError(err, url) {
  const missing = err && (err.name === "MissingPDFException" || (err.name === "UnexpectedResponseException" && err.status === 404));
  if (missing) {
    readerMessage(`<i class="fa-regular fa-file-lines reader-ico"></i><strong>या अंकाचा PDF अजून उपलब्ध नाही.</strong><span>तो लवकरच जोडला जाईल.</span>`);
    return;
  }
  const invalid = err && err.name === "InvalidPDFException";
  readerMessage(`<i class="fa-solid fa-triangle-exclamation reader-ico warn"></i>
    <strong>${invalid ? "ही फाईल PDF म्हणून उघडता आली नाही." : "PDF येथे दाखवता आला नाही."}</strong>
    <span>${invalid ? "फाईल खराब असू शकते." : "इंटरनेट तपासा आणि पुन्हा प्रयत्न करा."} किंवा PDF नवीन टॅबमध्ये उघडा / डाउनलोड करा.</span>
    <div class="reader-fallback">
      <button type="button" class="btn-reader primary" onclick="retryReader()"><i class="fa-solid fa-rotate-right"></i> पुन्हा प्रयत्न करा</button>
      <a class="btn-reader" href="${url}" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> नवीन टॅबमध्ये उघडा</a>
      <a class="btn-reader" href="${url}" download><i class="fa-solid fa-download"></i> डाउनलोड</a>
    </div>`);
}

window.retryReader = function() {
  if (readerUrl) loadReader(readerUrl);
};

async function loadReader(url) {
  resetReader();
  const run = readerRun;
  readerUrl = url;
  const { body, pages } = readerParts();
  if (!body || !pages) return;
  body.scrollTop = 0;
  body.scrollLeft = 0;
  readerZoomIdx = 0;
  applyReaderZoom();
  showReaderLoading(url);

  try {
    const lib = await loadPdfJs();
    if (run !== readerRun) return;
    const task = lib.getDocument({ url: new URL(url, document.baseURI).href, ...PDF_OPEN_OPTIONS });      // (pdf.js resolves a relative file name against the ADDRESS, not the <base>: /weekly/42 would look in /weekly/assets/pdf/)
    readerTask = task;
    task.onProgress = (p) => { if (run === readerRun) updateReaderProgress(p.loaded, p.total); };
    const doc = await task.promise;
    if (run !== readerRun) { Promise.resolve(task.destroy()).catch(() => {}); return; }
    readerDoc = doc;
    clearTimeout(readerSlowTimer);

    const first = await doc.getPage(1);
    if (run !== readerRun) return;
    const vp = first.getViewport({ scale: 1 });
    const total = doc.numPages;
    const { status, ind } = readerParts();
    if (status) status.hidden = true;

    // empty page boxes first (so the scroll bar is right); the picture is drawn when the box comes near the screen
    for (let n = 1; n <= total; n++) {
      const wrap = document.createElement("div");
      wrap.className = "reader-page";
      wrap.dataset.page = String(n);
      wrap.dataset.label = `पान ${toDevanagari(n)}`;
      wrap.style.aspectRatio = `${vp.width} / ${vp.height}`;
      pages.appendChild(wrap);
    }
    const showIndicator = (current) => {
      if (ind) ind.innerHTML = `<span class="pi-lbl">पान </span>${toDevanagari(current)} / ${toDevanagari(total)}`;
    };
    showIndicator(1);

    readerPageObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        en.target._near = en.isIntersecting;
        if (en.isIntersecting) queueReaderPage(en.target);
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
        showIndicator(current);
      });
    };
    body.addEventListener("scroll", readerScrollHandler, { passive: true });

    // phone turned sideways / window resized: draw the pages again for the new width
    let lastWidth = body.clientWidth;
    let resizeTimer = 0;
    readerResizeObserver = new ResizeObserver(() => {
      if (Math.abs(body.clientWidth - lastWidth) < 8) return;
      lastWidth = body.clientWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refreshReaderPages, 200);
    });
    readerResizeObserver.observe(body);
  } catch (err) {
    if (run !== readerRun) return;
    showReaderError(err, url);
  }
}

// draw (or redraw) the pages that are near the screen
function refreshReaderPages() {
  if (!readerPageObserver) return;
  document.querySelectorAll("#reader-pages .reader-page").forEach((w) => {
    readerPageObserver.unobserve(w);
    readerPageObserver.observe(w);       // observe() reports the current state again -> renders / frees as needed
  });
}

// Pages are drawn one at a time: on a slow connection page 1 then gets the whole bandwidth instead of sharing it
// with pages 2 and 3, and the page the reader is looking at always goes first.
function queueReaderPage(wrap) {
  if (wrap._busy || wrap._queued) return;
  wrap._queued = true;
  readerQueue.push(wrap);
  pumpReaderQueue();
}

async function pumpReaderQueue() {
  if (readerDrawing) return;
  readerDrawing = true;
  try {
    while (readerQueue.length) {
      const { body } = readerParts();
      if (!body) break;
      const box = body.getBoundingClientRect();
      const midY = box.top + box.height / 2;
      const gap = (w) => { const r = w.getBoundingClientRect(); return Math.abs(r.top + r.height / 2 - midY); };
      readerQueue.sort((a, b) => gap(a) - gap(b));
      const wrap = readerQueue.shift();
      wrap._queued = false;
      if (!wrap.isConnected || wrap._near === false) continue;      // scrolled away while it was waiting
      await renderReaderPage(wrap);
    }
  } finally {
    readerDrawing = false;
  }
}

async function renderReaderPage(wrap) {
  if (wrap._busy) return;
  const doc = readerDoc;
  if (!doc) return;
  const run = readerRun;
  const cssW = Math.round(wrap.clientWidth) || 600;
  if (wrap.dataset.state === "done" && wrap.dataset.w === String(cssW)) return;   // already drawn for this width
  wrap._busy = true;
  let task = null;
  try {
    const page = await doc.getPage(Number(wrap.dataset.page));
    if (run !== readerRun) return;
    const base = page.getViewport({ scale: 1 });
    let scale = (cssW / base.width) * Math.min(window.devicePixelRatio || 1, 2);   // sharp enough, light enough for phones
    const px = base.width * base.height * scale * scale;
    if (px > READER_MAX_PIXELS) scale *= Math.sqrt(READER_MAX_PIXELS / px);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.className = "reader-canvas";
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    task = page.render({ canvasContext: canvas.getContext("2d"), viewport });
    readerRenders.add(task);
    await task.promise;
    page.cleanup();                                      // let go of the decoded images of this page
    if (run !== readerRun || !wrap.isConnected) return;
    const old = wrap.querySelector("canvas");
    wrap.style.aspectRatio = `${base.width} / ${base.height}`;
    wrap.appendChild(canvas);
    if (old) { old.width = 0; old.height = 0; old.remove(); }
    wrap.dataset.state = "done";
    wrap.dataset.w = String(cssW);
  } catch (e) {
    /* cancelled (reader closed) or one broken page: it stays empty and is tried again when it comes into view */
  } finally {
    if (task) readerRenders.delete(task);
    wrap._busy = false;
    if (readerRun === run && wrap.isConnected) {
      if (wrap.dataset.state === "done" && wrap.dataset.w !== String(Math.round(wrap.clientWidth))) queueReaderPage(wrap);   // width changed while drawing (zoom / rotate)
      else if (wrap._near === false && readerDoc && readerDoc.numPages > 8) releaseReaderPage(wrap);                           // scrolled far away meanwhile
    }
  }
}

function releaseReaderPage(wrap) {
  if (wrap._busy || wrap.dataset.state !== "done") return;
  const canvas = wrap.querySelector("canvas");
  if (canvas) { canvas.width = 0; canvas.height = 0; canvas.remove(); }
  delete wrap.dataset.state;
  delete wrap.dataset.w;
}

// ---- zoom ----
function applyReaderZoom() {
  const { body } = readerParts();
  const z = READER_ZOOMS[readerZoomIdx];
  if (body) { body.dataset.zoom = String(z); body.style.setProperty("--zoom", String(z)); }
  const val = document.getElementById("reader-zoom-val");
  if (val) val.textContent = `${toDevanagari(Math.round(z * 100))}%`;
  const out = document.getElementById("reader-zoom-out");
  const inn = document.getElementById("reader-zoom-in");
  if (out) out.disabled = readerZoomIdx === 0;
  if (inn) inn.disabled = readerZoomIdx === READER_ZOOMS.length - 1;
}

function setReaderZoom(idx) {
  const { body } = readerParts();
  idx = Math.max(0, Math.min(READER_ZOOMS.length - 1, idx));
  if (!body || idx === readerZoomIdx) return;
  // keep the reading position: remember which point of the document is in the middle of the screen
  const cx = (body.scrollLeft + body.clientWidth / 2) / Math.max(1, body.scrollWidth);
  const cy = (body.scrollTop + body.clientHeight / 2) / Math.max(1, body.scrollHeight);
  readerZoomIdx = idx;
  applyReaderZoom();
  body.scrollLeft = cx * body.scrollWidth - body.clientWidth / 2;
  body.scrollTop = cy * body.scrollHeight - body.clientHeight / 2;
  refreshReaderPages();
}

window.readerZoomBy = function(step) {
  setReaderZoom(readerZoomIdx + step);
};

// Open the PDF e-paper of an issue (no argument = the latest issue)
window.openWeeklyModal = function(idOrNothing) {
  const byId = typeof idOrNothing === "number" ? articlesData.find((a) => a.id === idOrNothing) : null;
  const issue = byId && byId.issue ? byId : latestIssue();
  if (!issue) { navigate("weekly"); return; }   // no issue yet (the sidebar ad): the Weekly page with its empty card
  if (!WEEKLY_PDF) {                       // PDFs are switched off: the nearest thing is the issue's own page
    navigate("issue-" + issue.issue);
    return;
  }
  currentModalArticle = issue;

  const modal = document.getElementById("weekly-epaper-modal");
  if (!modal) return;
  const url = pdfUrlFor(issue);
  const title = document.getElementById("reader-title");
  if (title) title.innerHTML = `<i class="fa-solid fa-file-pdf" style="color:var(--accent-red); margin-right:6px"></i> ${issueLabel(issue)} • साप्ताहिक ई-पेपर`;
  const dl = document.getElementById("reader-download");
  if (dl) {
    dl.href = url;
    dl.setAttribute("download", `Lokmangal-Weekly-${issue.issue}.pdf`);
    if (isSameOrigin(url)) dl.removeAttribute("target"); else { dl.target = "_blank"; dl.rel = "noopener"; }
  }
  const open = document.getElementById("reader-open");
  if (open) open.href = url;
  setReaderSize(0);
  pdfInfo(url).then((i) => { if (i.bytes && readerUrl === url) setReaderSize(i.bytes); });   // file size on the download button

  showModal(modal);
  loadReader(url);
};

window.closeModals = function(silent) {
  const wasOpen = !!document.querySelector(".modal-overlay.active");
  const reader = document.getElementById("weekly-epaper-modal");
  if (reader && reader.classList.contains("active")) resetReader();   // free the PDF pages
  const videoWindow = document.getElementById("video-player-modal");
  const hadVideo = !!(videoWindow && videoWindow.classList.contains("active"));
  if (hadVideo) stopVideoPlayer();   // the video stops with its window
  document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
  syncScrollLock();
  if (wasOpen && focusBeforeModal && document.contains(focusBeforeModal)) {
    focusBeforeModal.focus({ preventScroll: true });
  }
  focusBeforeModal = null;
  if (wasOpen && silent !== true) releaseOverlayHistory();
  if (hadVideo) leaveVideoAddress();
};

// Listen to Escape key & click outside
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModals();
    closeDrawer();
    closeSearchBar();
    return;
  }
  // PDF reader: + / - / 0 change the zoom (not while typing in a field)
  if (document.querySelector("#weekly-epaper-modal.active") && !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || "")) {
    if (e.key === "+" || e.key === "=") readerZoomBy(1);
    else if (e.key === "-" || e.key === "_") readerZoomBy(-1);
    else if (e.key === "0") setReaderZoom(0);
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
  if (!issue) return;                      // the site has no weekly issue at all
  const a = document.createElement("a");
  a.href = pdfUrlFor(issue);
  a.download = `Lokmangal-Weekly-${issue.issue}.pdf`;
  if (!isSameOrigin(a.href)) { a.target = "_blank"; a.rel = "noopener"; }
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast(`📥 साप्ताहिक आवृत्ती (${issueLabel(issue)}) PDF डाऊनलोड होत आहे...`);
};

// Speech reader
window.toggleReadAloud = function(articleId) {
  if (!('speechSynthesis' in window)) {
    showToast("ऑडिओ वाचन उपलब्ध नाही.");
    return;
  }
  const article = articlesData.find(a => a.id === articleId) || articlesData[0];
  const utter = new SpeechSynthesisUtterance(article.title + ". " + plainOf(article.excerpt));
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

// Smart Auto-Hide on Scroll, Auto-Reveal on Stop / Scroll Up
function initSmartHeader() {
  const headerWrapper = document.getElementById("site-header-wrapper");
  if (!headerWrapper) return;

  let lastScrollY = window.scrollY;
  let scrollStopTimer = null;
  let ticking = false;

  const onScroll = () => {
    const currentScrollY = window.scrollY;
    const diff = currentScrollY - lastScrollY;

    // Toggle subtle drop-shadow when scrolled
    if (currentScrollY > 8) {
      headerWrapper.classList.add("is-scrolled");
    } else {
      headerWrapper.classList.remove("is-scrolled");
    }

    // Always keep visible when near the top of the page
    if (currentScrollY <= 25) {
      headerWrapper.classList.remove("header-hidden");
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }

    // Do not hide if mobile drawer or search overlay is open
    const drawerOpen = typeof isDrawerOpen === "function" ? isDrawerOpen() : false;
    const searchOpen = document.getElementById("search-overlay-bar")?.classList.contains("show");
    const isLocked = document.documentElement.classList.contains("scroll-locked");
    if (drawerOpen || searchOpen || isLocked) {
      headerWrapper.classList.remove("header-hidden");
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }

    // Actively scrolling down: hide header
    if (diff > 5) {
      headerWrapper.classList.add("header-hidden");
    }
    // Scrolling up: show header immediately
    else if (diff < -5) {
      headerWrapper.classList.remove("header-hidden");
    }

    // When scrolling stops, reveal header smoothly ("jevha scroll thambavel na tevha to aal pahije")
    clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(() => {
      headerWrapper.classList.remove("header-hidden");
    }, 250);

    lastScrollY = currentScrollY;
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
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

// js/i18n.js gives the website its two languages; without it everything stays Marathi
window.trUI = window.trUI || ((text) => text);
window.getLang = window.getLang || (() => "mr");
window.localizeDates = window.localizeDates || ((text) => text);

// Where the Python backend lives (js/config.js). "" = same address as this page.
const API_BASE = (window.LOKMANGAL_CONFIG && window.LOKMANGAL_CONFIG.API_BASE) || '';

// ===================================================================
// Sync Portal with Python Flask REST API (/api/articles, /api/weekly & /api/videos)
// Allows newly created articles/editions/videos in the Admin Panel to show immediately
// ===================================================================
// One answer of the backend (parsed JSON), or null when there is none. A dropped connection - or an answer that breaks off halfway - is
// asked ONCE more: on a flaky phone network one hiccup must not leave the built-in data on the screen (or send a shared #post link to Home).
// A clear "no" (404 on a static host, any other 4xx) is not asked again.
async function apiJson(path) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(API_BASE + path);
      if (res.ok) return await res.json();
      if (res.status < 500) return null;
    } catch (err) { /* connection dropped / half an answer: one more try below */ }
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return null;
}

// A reader opened a news / blog: one more view (POST /api/articles/<id>/read; see viewsOf - the Review section lists the most viewed).
// Once per story and tab: Back / Forward, a refresh or the language switch show the same story again without counting it. Only once
// the backend has answered (a static host has none; a story opened before the answer is counted when the answer draws it again).
const readsSent = new Set();
function countRead(article) {
  if (!backendCounts || !article || article.category === "weekly" || readsSent.has(article.id)) return;
  readsSent.add(article.id);
  const key = "lokmangal-read-" + article.id;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch (e) { /* storage blocked: counted once per page load (the backend limits repeats as well) */ }
  // (the answer is read so the request ends: an unread one stays open, and crawlers that wait for a quiet network wait for it)
  fetch(`${API_BASE}/api/articles/${article.id}/read`, { method: "POST" }).then((r) => r.text()).catch(() => { /* not counted: nothing to show */ });
}

// --- Footer "कार्यालय संपर्क": office address, phone, e-mail (Admin Panel > Footer) --------------------------------------------------
// The details come from js/settings-data.js (kept by the backend, for a static host) and then GET /api/settings. A detail that was left
// empty is not shown, and neither is the block when all three are empty. Text is put in with textContent (never as HTML).
// (no placeholder phone / e-mail / address is written anywhere: the footer block stays hidden until the Admin Panel's real details have arrived)
const emptySiteSettings = { office_address: "", office_address_en: "", office_phone: "", office_email: "" };
const defaultSiteSettings = emptySiteSettings;
let siteSettings = !staticDataAllowed ? emptySiteSettings
  : window.SITE_SETTINGS && typeof window.SITE_SETTINGS === "object" ? { ...defaultSiteSettings, ...window.SITE_SETTINGS } : defaultSiteSettings;

// The address as Google Maps should look for it: without the label an owner may have typed in front of it ("कार्यालयाचा पत्ता:", "Office address:") and
// the word "पिनकोड:", with the digits as 0-9 (the PIN code is the part that places the pin in the right town).
const mapQueryOf = (address) => String(address)
  .replace(/^\s*(कार्यालयाचा\s+पत्ता|कार्यालय\s+पत्ता|पत्ता|office\s+address|address)\s*[:：-]\s*/i, "")
  .replace(/पिन\s*कोड\s*[:：-]?/g, "")
  .replace(/pin\s*code\s*[:：-]?/ig, "")
  .replace(/[०-९]/g, (d) => "०१२३४५६७८९".indexOf(d))
  .replace(/\s+/g, " ")
  .trim();

function renderFooterContact() {
  const s = siteSettings;
  const text = (v) => String(v == null ? "" : v).trim();
  const address = getLang() === "en" && text(s.office_address_en) ? text(s.office_address_en) : text(s.office_address);
  const phone = /^[+()\d\s-]{1,40}$/.test(text(s.office_phone)) ? text(s.office_phone) : "";
  const email = /^[^@\s<>"']+@[^@\s<>"']+\.[^@\s<>"']+$/.test(text(s.office_email)) ? text(s.office_email) : "";
  const show = (row, id, value, href) => {
    const rowEl = document.getElementById(row), el = document.getElementById(id);
    if (!rowEl || !el) return;
    rowEl.hidden = !value;
    if (!value) return;
    el.textContent = value;
    if (href) el.setAttribute("href", href);
  };
  if (window.LokmangalSEO) window.LokmangalSEO.setContact({ address, phone, email });
  show("footer-row-address", "footer-address", address);
  // the address is a link to Google Maps (the whole row: icon, label and text - see .footer-map-link in style.css)
  const addressEl = document.getElementById("footer-address");
  if (addressEl && address) {
    const link = document.createElement("a");
    link.className = "footer-map-link";
    link.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mapQueryOf(address));
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = getLang() === "en" ? "View on Google Maps" : "Google Maps वर पाहा";
    link.textContent = address;
    addressEl.textContent = "";
    addressEl.appendChild(link);
  }
  show("footer-row-phone", "footer-phone", phone, "tel:" + (phone.startsWith("+") ? "+" : "") + phone.replace(/\D/g, ""));
  show("footer-row-email", "footer-email", email, "mailto:" + email);
  const box = document.getElementById("footer-contact");
  if (box) box.hidden = !(address || phone || email);
}

// Merges the news rows of the database - GET /api/articles, or js/articles-data.js on a static host - into articlesData.
function mergeArticleRows(rows) {
  const dbIds = new Set(rows.map((a) => a.id));
  // Oldest first: every NEW article is put at the front of the list, so the newest one ends up on top.
  rows.slice().sort((a, b) => a.id - b.id).forEach((row) => {
    const dbArt = { ...row, category: row.category === 'reviews' ? 'review' : row.category };   // older admin spelling
    const idx = articlesData.findIndex(a => a.id === dbArt.id);
    if (idx !== -1) {
      articlesData[idx] = { ...articlesData[idx], ...dbArt };
    } else {
      articlesData.unshift(dbArt);
    }
  });
  // The database is the truth for what it holds: a built-in article that was DELETED in the Admin Panel
  // leaves the website too.
  articlesData = articlesData.filter((a) => a.category === 'weekly' || dbIds.has(a.id));
}

// A static host (Vercel) has no backend: the news the owner changed in the Admin Panel (edited, Popular / Lead / Random / Latest, new,
// deleted) come from js/articles-data.js, which the backend keeps equal to the database. Merged before the page is drawn for the first
// time; with a backend GET /api/articles replaces it (syncPortalWithApi).
function loadStaticArticles() {
  if (!staticDataAllowed || !Array.isArray(window.ARTICLES_DATA)) return;
  articlesData.forEach((a) => restoreRawFields(a, true));
  mergeArticleRows(window.ARTICLES_DATA);
  articlesData.sort(newerFirst);
  fillBuiltInEnglish();
}

async function syncPortalWithApi() {
  try {
    const [artJson, weekJson, vidJson, adJson, setJson] = await Promise.all([apiJson('/api/articles'), apiJson('/api/weekly'), apiJson('/api/videos'), apiJson('/api/ads'), apiJson('/api/settings')]);
    articlesData.forEach((a) => restoreRawFields(a, true));      // the backend's rows are raw (Marathi) text: merge into raw text, then apply the language again
    let hasUpdates = false;
    // (an EMPTY list counts too: when the last news is deleted in the Admin Panel the built-in ones must not come back)
    if (artJson && artJson.success && Array.isArray(artJson.articles)) {
      mergeArticleRows(artJson.articles);
      backendCounts = true;
    }
    if (weekJson) {
      // (an EMPTY list counts too: when the last issue is deleted in the Admin Panel the 68 built-in issues must not come back)
      if (weekJson.success && Array.isArray(weekJson.issues)) {
        const dbIssues = new Set();
        weekJson.issues.forEach(row => {
          const no = Number(row.issue_no);
          if (!Number.isInteger(no) || no < 1) return;
          dbIssues.add(no);
          // API row (issue_no, pdf_filename, description ...) -> same shape as the built-in issues
          const issue = {
            ...makeWeeklyArticle({ no, date: row.date, title: row.title, img: row.image, views: row.views, desc: row.description, titleEn: row.title_en, descEn: row.description_en }),
            issue: no,
          };
          if (row.pdf_filename && row.pdf_filename !== pdfFileName(no)) {
            issue.pdf = /^https:\/\//i.test(row.pdf_filename) ? row.pdf_filename : PDF_BASE + row.pdf_filename;   // (a full address, or a file name in PDF_BASE)
          }
          const idx = articlesData.findIndex(a => a.category === 'weekly' && a.issue === no);
          if (idx !== -1) {
            articlesData[idx] = { ...articlesData[idx], ...issue };
          } else {
            articlesData.push(issue);
            hasUpdates = true;
          }
        });
        // an issue deleted in the Admin Panel leaves the website too
        articlesData = articlesData.filter((a) => a.category !== 'weekly' || dbIssues.has(a.issue));
      }
    }
    if (vidJson && vidJson.success && Array.isArray(vidJson.videos)) {
      // the owner's uploads, newest first; none uploaded (or all deleted) = the sample videos
      videoPostsData = vidJson.videos.length ? vidJson.videos.map(videoFromRow) : builtInVideos;
      renderFeaturedVideos();
    }
    if (setJson && setJson.success && setJson.settings && typeof setJson.settings === 'object') {
      siteSettings = { ...defaultSiteSettings, ...setJson.settings };
      renderFooterContact();
    }
    if (adJson && adJson.success && Array.isArray(adJson.ads)) {
      adsData = adJson.ads;                // (an EMPTY list counts too: every ad deleted in the Admin Panel leaves the website)
      renderAds();
    }
    if (artJson || weekJson) {
      apiSyncPending = false;          // from now on an unknown address really is unknown
      routeWaitingForApi = false;
      articlesData.sort(newerFirst);   // the most recently updated news first (Latest, every section)
      fillBuiltInEnglish();            // (a row without English text must not wipe the built-in English)
      applyDataLanguage();
      if (typeof renderLabelCounts === 'function') renderLabelCounts();
      renderLeftSidebar();
      renderRightSidebar();
      // The slide-out "Popular Items" list is built when the menu is first opened (its photos are not
      // downloaded before that). Refresh it here only if it was already built, so it shows the new data.
      if (drawerPopularRendered && typeof renderDrawerPopularItems === 'function') {
        renderDrawerPopularItems();
      }
      if (typeof renderRoute === 'function') {
        renderRoute({ scroll: false });
      }
    }
    openVideoFromAddress();                // (/video/<words> of a video the backend brought)
    if (!videoAddressDone && vidJson) {    // ... or of no video (any more): the Home page, under its own address
      videoAddressDone = true;
      replaceUrl("");
      renderRoute({ scroll: false });
    }
  } catch (err) {
    console.warn('API sync fallback to local data:', err);
  } finally {
    applyDataLanguage();               // (also when nothing came: the page data must not be left in raw Marathi while English is chosen)
    if (apiSyncPending) {              // no usable answer (no backend / error): an address that was waiting for it falls back to Home now
      apiSyncPending = false;
      if (routeWaitingForApi) {
        routeWaitingForApi = false;
        if (typeof renderRoute === 'function') renderRoute({ scroll: false });
      }
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', syncPortalWithApi);
} else {
  syncPortalWithApi();
}
