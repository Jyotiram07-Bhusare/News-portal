/* English text of the content that is BUILT INTO the website: the 18 news items (ids 1-18) and the 68 weekly issues.
 *
 * Why: the Marathi text of these lives in js/app.js (articlesData), js/weekly-data.js and the database. While English is chosen
 * (the "MR | EN" button) js/app.js shows this text instead - so the existing content turns English too, also on a static host
 * (Vercel) that has no backend.
 *
 *   articles: { <id>:       { title, author, excerpt, content } }     content = the same HTML as the Marathi article
 *   weekly:   { <issue_no>: { title, desc } }
 *
 * It only FILLS what is empty: English typed in the Admin Panel (title_en ...) always wins over this file. News added later
 * in the Admin Panel does not need an entry here - it carries its own English text.
 * The same text is in backend/seed/*.json (title_en ...), so a new database gets it too. */
window.LOKMANGAL_CONTENT_EN = {
  "articles": {
    "1": {
      "title": "Solapur South Assembly Election: MLA Subhash Bapu Deshmukh's Historic Victory; Opponents Defeated by a Margin of Over 77,000 Votes",
      "author": "Special Political Correspondent",
      "excerpt": "In the Solapur South Assembly constituency, Mahayuti and BJP candidate MLA Subhash (Bapu) Deshmukh secured 1,16,932 votes and won a resounding victory by a record margin of 77,127 votes.",
      "content": "<p><strong>Solapur:</strong> In the fiercely contested election in the Solapur South Assembly constituency, senior BJP leader and former Cooperation Minister MLA Subhash (Bapu) Sureshchandra Deshmukh has scored a historic victory. Fielded by the Mahayuti in this election, Subhash Deshmukh polled a record 1 lakh 16 thousand 932 votes. His nearest rival, Amar Ratikant Patil of the Shiv Sena (UBT), received 39,805 votes, and Deshmukh won this resounding victory by a huge margin of 77,127 votes.</p> <p>This is Subhash Bapu Deshmukh's third consecutive victory in the Solapur South constituency, and the people have once again expressed firm faith in his leadership. As soon as the result was announced, party workers in Solapur city and the southern taluka celebrated wildly with fireworks and showers of gulal.</p> <p><strong>MLA Subhash Deshmukh's address at the victory meeting:</strong> “This victory is not mine; it belongs to the people of South Solapur, the farmers, the mothers and sisters, and the loyal workers who toil day and night. I will repay the debt of this unprecedented mandate by keeping the stream of development in the constituency flowing without a break,” Deshmukh said confidently.</p> <p>In this election, voters gave an overwhelming verdict in favour of the firm stand Deshmukh took on rural irrigation projects, village roads, industrialisation and welfare schemes for farmers.</p>"
    },
    "2": {
      "title": "Grand ‘Inter-faith Community Wedding Ceremony’ in Solapur by Lokmangal Foundation; Hundreds of Couples Married Free of Cost!",
      "author": "Lokmangal Social Correspondent",
      "excerpt": "At the inter-faith community wedding ceremony organised with the inspiration of founder Subhash Bapu Deshmukh, hundreds of couples were married; Lokmangal Foundation stood by the brides and grooms by giving them a free mangalsutra, household utensils and a token of honour.",
      "content": "<p><strong>Solapur:</strong> Because economically weak families cannot afford the heavy cost of a wedding, farmers and working-class families are pushed into a mountain of debt. To overcome this social problem and to nurture the spirit of equal respect for all religions, Lokmangal Foundation once again organised a grand inter-faith community wedding ceremony in Solapur this year.</p> <p>Under the concept of founder-president Subhash Bapu Deshmukh, this initiative has been run without a break for the past two decades, and this year too hundreds of couples were married in a joyous ceremony according to their religious customs. The Foundation gave every participating bride and groom wedding clothes, haldi outfits, and, for the bride, a ceremonial gold mangalsutra, toe rings and a complete 51-piece set of utensils useful for setting up a home, all free of cost.</p> <p><strong>Meals and arrangements for thousands of relatives:</strong> A grand arrangement of delicious mahaprasad was made for the relatives and wedding guests of all the couples who took part. The brides and grooms were also counselled on the prevention of female foeticide and on family health.</p> <p>“Community weddings are the need of the hour, and they save poor farmers from sliding into the abyss of suicide. This ceremony is not merely a wedding; it is a step towards social revolution,” the office-bearers of Lokmangal Foundation said.</p>"
    },
    "3": {
      "title": "MLA Subhash Bapu Deshmukh Included in the New Core Committee of BJP Solapur City and District; Strategy for the Upcoming Municipal Elections Finalised",
      "author": "Solapur Political Bureau",
      "excerpt": "The Bharatiya Janata Party has announced a new 13-member core committee for Solapur city and the eastern region, in which senior leader MLA Subhash Deshmukh has been given a place of honour in the party's decision-making.",
      "content": "<p><strong>Solapur:</strong> The BJP's state leadership has announced a special 13-member core committee to give new momentum to the organisation in Solapur city and the eastern region. It includes the party's senior leader and South Solapur MLA Subhash (Bapu) Deshmukh.</p> <p>After the political developments of the past few months, Subhash Deshmukh has regained a place of honour in the party's highest local decision-making body, creating a wave of enthusiasm among workers. In the run-up to the upcoming Solapur Municipal Corporation, Zilla Parishad and Panchayat Samiti elections, this committee will draw up the party's strategy.</p> <p>Guiding the core committee at its very first review meeting, MLA Subhash Deshmukh said, “To work for the development of Solapur and to prove worthy of the trust of ordinary people, all the party's office-bearers and workers must work with one mind. Taking the people-friendly schemes of the Centre and the State to the last person will remain our main objective.”</p>"
    },
    "4": {
      "title": "‘Lokmangal Annapurna Yojana’: A Pillar of Support Delivering a Free Nutritious Meal Box Every Day to the Doorsteps of Needy, Destitute and Elderly Citizens in Solapur",
      "author": "Snehal Patil (Social Correspondent)",
      "excerpt": "The Lokmangal Annapurna Yojana is proving a lifeline for thousands of senior citizens, disabled and destitute people who go without two square meals a day; tiffins prepared with cleanliness and love are delivered straight to their homes.",
      "content": "<p><strong>Solapur:</strong> Putting into practice the motto “a morsel for the hungry and water for the thirsty”, the ‘Lokmangal Annapurna Yojana’ has become a genuine support for thousands of elderly and destitute people in Solapur city today. The initiative was started from the compassionate vision of Subhash Bapu Deshmukh, founder of Lokmangal Foundation.</p> <p>There are many elderly couples and destitute people who, because of illness or poverty, cannot cook for themselves. Tracing such families, Lokmangal's volunteers deliver a box of hot, fresh and nutritious food to their homes every afternoon and evening.</p> <p><strong>Special emphasis on cleanliness and quality:</strong> Extremely pure and sattvic food is prepared in Lokmangal's central kitchen. It contains a balanced meal of chapati, vegetable, dal-rice and nutritious ingredients. Thousands of families have benefited from the scheme so far, and many senior citizens have praised this service of Lokmangal wholeheartedly, with gratitude.</p>"
    },
    "5": {
      "title": "Solapur District Central Bank (DCC Bank) Election: MLA Subhash Bapu Deshmukh's Resolution Approved; Cooperative Sector Activity Picks Up Pace",
      "author": "Cooperative News Correspondent",
      "excerpt": "Ahead of the Solapur DCC Bank election, the resolution naming MLA Subhash Deshmukh as Lokmangal Bank's voting representative has been approved; he has raised his voice for transparency in the district bank and for the interests of farmers.",
      "content": "<p><strong>Solapur:</strong> Senior cooperative leader and MLA Subhash (Bapu) Deshmukh has made a powerful entry into the political arena of the Solapur District Central Cooperative Bank (DCC Bank) election. A resolution naming Subhash Deshmukh as the official representative of Lokmangal Urban Cooperative Bank has been passed unanimously.</p> <p>As Maharashtra's Cooperation Minister earlier, Subhash Deshmukh had taken significant legal steps to curb corruption in the cooperative sector and to bring financial discipline to cooperative banks. His active participation in the Solapur DCC Bank election has now turned the equations in the cooperative sector of the entire district.</p> <p><strong>Demand for transparency from the Divisional Joint Registrar:</strong> To prevent malpractice in the resolution process and to ensure that all primary cooperative societies get an equal right to vote, MLA Deshmukh has given the cooperation department a written request to follow the rules strictly. “The District Central Bank has been built from the hard-earned money of ordinary farmers. This bank must protect only the interests of farmers,” Deshmukh warned plainly.</p>"
    },
    "6": {
      "title": "‘Lokmangal Jalkranti’ for a Drought-Free Future: Stream Deepening and Cement Check Dams in Over 100 Villages; Groundwater Level Rises Significantly",
      "author": "Anand Mohite (Water Envoy)",
      "excerpt": "To end water scarcity for good, Lokmangal Foundation ran a massive water-conservation campaign in drought-hit villages; thousands of acres of farmland now have protected irrigation.",
      "content": "<p><strong>Solapur:</strong> The drought-hit areas of Solapur and the neighbouring Dharashiv district had to depend on tankers for water every year. To overcome this crisis permanently, Lokmangal Foundation took up ‘Lokmangal Jalkranti’, a grand people's movement.</p> <p>With the help of the Foundation's heavy machinery, stream deepening, silt removal, cement stream bunds and farm ponds were completed on a war footing in over 100 villages in the Solapur South, North and Barshi areas. By stopping every drop of rainwater and letting it percolate into the ground, the water level of wells and borewells in the area has been recorded to have risen by as much as 4 to 6 feet.</p> <p><strong>Green crops in farmers' fields:</strong> With water available, farmers have been able to harvest a bumper yield of onion, jowar and vegetables in the rabi season. Many villages have proudly declared themselves tanker-free, and villagers have sincerely thanked Lokmangal for this Bhagirath effort.</p>"
    },
    "7": {
      "title": "Union Road Transport Minister Nitin Gadkari Pays a Courtesy Visit to MLA Subhash Deshmukh's Residence; Solapur Ring Road and Highway Projects Discussed",
      "author": "Special Political Reporter",
      "excerpt": "Union Minister Nitin Gadkari, on a visit to Solapur, paid a courtesy call at MLA Subhash Deshmukh's residence and held an in-depth discussion on Solapur's bypass road (Ring Road), flyovers and industrial connectivity.",
      "content": "<p><strong>Solapur:</strong> Union Minister for Road Transport and Highways Nitin Gadkari paid a courtesy visit to the residence of South Solapur MLA Subhash (Bapu) Deshmukh during his Solapur tour. During the visit, the two senior leaders had an important discussion on infrastructure development of Solapur city and the rural areas, the network of national highways and industrial growth.</p> <p>MLA Subhash Deshmukh sought special funds from Gadkari for speedy completion of the planned Ring Road around Solapur city, a flyover on the Solapur–Vijayapur highway and the concreting of rural link roads. The Union Minister responded positively to these demands and directed the National Highways Authority officials to carry out the necessary survey immediately.</p> <p>This courtesy visit has brought fresh energy among BJP workers in Solapur district, and road development will give a big boost to Solapur's textile industry and the transport of agricultural produce.</p>"
    },
    "8": {
      "title": "Lokmangal Maha-Health Check-up Camp and Blood Donation Drive: Free Check-ups, Treatment and Cataract Surgeries for Over 5,000 Citizens",
      "author": "Health Desk",
      "excerpt": "To look after the health of rural people, Lokmangal Foundation held a grand maha-health camp in the presence of expert doctors; free spectacles were distributed to hundreds of patients and surgeries planned.",
      "content": "<p><strong>Solapur:</strong> Because of the lack of health facilities in rural areas and the high cost of treatment, many poor patients are deprived of care. To overcome this, Lokmangal Foundation successfully organised a grand maha-health check-up camp and blood donation drive.</p> <p>A team of renowned cardiologists, eye specialists, gynaecologists and paediatricians from Pune, Mumbai and Solapur examined more than 5,000 villagers free of cost. Free ECG, blood tests, sugar and BP checks were done at the camp. All the necessary medicines were distributed free to needy patients.</p> <p><strong>Free cataract surgeries and blood donation:</strong> More than 300 senior citizens found to have cataracts will be operated on completely free of cost by Lokmangal. Young people also took part spontaneously, collecting more than 350 bags of blood and meeting the needs of the blood banks of Solapur district.</p>"
    },
    "9": {
      "title": "Bhoomipujan of Development Works Worth Crores for Roads, Irrigation and Water Supply in South Solapur Constituency: MLA Subhash Deshmukh",
      "author": "Rural Development Reporter",
      "excerpt": "The launch of various development works worth crores of rupees, sanctioned by the government to provide quality roads and clean drinking water to every village in South Solapur taluka, was performed by MLA Subhash Deshmukh.",
      "content": "<p><strong>South Solapur:</strong> Saying he is committed to transforming the face of the constituency's rural areas, MLA Subhash (Bapu) Deshmukh performed the bhoomipujan of road asphalting, water supply schemes under the Jal Jeevan Mission and underground drainage works in various villages of the taluka.</p> <p>Thanks to MLA Subhash Deshmukh's consistent follow-up, a special development fund of crores of rupees has been sanctioned for South Solapur from the state government's budget. It includes upgrading rural hospitals, repairing primary health sub-centres and installing new transformers to provide a smooth three-phase power supply to farm pumps.</p> <p>“Meeting the basic needs of every citizen and making villages self-reliant is our politics. Once elections are over, we think only of development,” Deshmukh said at village meetings.</p>"
    },
    "10": {
      "title": "Lokmangal Farmers' Guidance Meet for Agriculture and Sugarcane Growers: Drip Irrigation, Modern Fertiliser Management and High-Yield Technology",
      "author": "Agriculture News Special",
      "excerpt": "In-depth guidance from agriculture experts on modern farm technology, drip irrigation and balanced use of organic fertilisers to help sugarcane growers reach 100 tonnes per acre.",
      "content": "<p><strong>Solapur:</strong> With the aim of cutting the cost of production in farming and doubling farmers' income, the Lokmangal Group organised a grand guidance meet for farmers and sugarcane growers. Thousands of farmers from Solapur and surrounding areas attended the meet.</p> <p>Expert scientists from the Vasantdada Sugar Institute (VSI) and Mahatma Phule Agricultural University guided farmers, with demonstrations, on improved sugarcane varieties, seed treatment, management of water-soluble fertilisers through drip irrigation, and pest control. The Lokmangal Group also held an exhibition of modern farm implements.</p> <p>While guiding the farmers, it was stressed that producing the best quality yield with the least water is the need of the day. On behalf of Lokmangal, drip sets and quality organic fertilisers are being made available to farmers on easy instalments.</p>"
    },
    "11": {
      "title": "‘The Cooperative Movement Is the Lifeblood of Rural Maharashtra’: Former Cooperation Minister Subhash Deshmukh's Forthright Statement at a State-Level Conference",
      "author": "State Bureau",
      "excerpt": "The rural economy will become stronger only if cooperative institutions adopt modern technology and transparency; former Cooperation Minister Subhash Deshmukh appealed for a focus on strengthening cooperative sugar factories and banks.",
      "content": "<p><strong>Pune:</strong> Speaking as the chief speaker at the Maharashtra State Cooperative Conference, former Cooperation and Marketing Minister MLA Subhash (Bapu) Deshmukh put forward forthright views on the present condition and future direction of the state's cooperative sector.</p> <p>Deshmukh said, “The cooperative movement in Maharashtra has given rural people economic freedom. But in changing times, cooperative sugar factories must not depend on sugar alone; they must turn to ethanol, CBG (bio-gas) and co-generation power. Transparent administration and professional management are the saviours of cooperation.”</p> <p>Those present praised the reforms in cooperative law and the computerisation initiatives he carried out during his tenure as Cooperation Minister. Cooperative experts said that Subhash Deshmukh's views have always been a guide for fairness in the cooperative sector.</p>"
    },
    "12": {
      "title": "‘Lokmangal Udyogini Exhibition and Sales Fair’ for Women's Economic Empowerment: A Guaranteed Market for Self-Help Group Products",
      "author": "Women's Development Forum",
      "excerpt": "The Lokmangal Udyogini Fair, giving a platform to quality products made by more than 300 rural women's self-help groups, was held with enthusiasm; business worth lakhs and a boost to women's confidence.",
      "content": "<p><strong>Solapur:</strong> To help rural women stand on their own feet and get a fair return for their skills, Lokmangal Foundation organised the four-day ‘Lokmangal Udyogini Exhibition and Sales Fair’.</p> <p>More than 100 stalls were set up at the exhibition, offering handloom cloth, traditional foods, organic spices, decorative handicrafts and household goods made by self-help groups of Solapur district. The people of Solapur responded spontaneously and bought goods worth lakhs of rupees.</p> <p>With the cooperation of Lokmangal Bank, interested women were also given easy finance and free training in digital marketing to start their own small businesses.</p>"
    },
    "13": {
      "title": "MLA Subhash Deshmukh Gives Strict Directions to the Water Resources Department to Release Irrigation Rotations of the Sina and Bhima Canals on Time",
      "author": "Agriculture and Irrigation Cell",
      "excerpt": "So that crops in the rabi season do not suffer a water shortage and water reaches tail-end farmers, MLA Subhash Bapu Deshmukh held an urgent meeting with senior officials of the Water Resources Department.",
      "content": "<p><strong>Solapur:</strong> To ensure that crops in South Solapur and Akkalkot get water on time, MLA Subhash (Bapu) Deshmukh has strictly directed Water Resources Department officials to release immediately the rotations of the Sina–Bhima lift irrigation scheme and the Ujani left canal.</p> <p>Presenting the farmers' grievances at the water distribution committee meeting, Deshmukh made it clear that complaints of not a single drop of water reaching farmers at the tail end of the canals would not be tolerated. He cautioned that the canals must be repaired immediately and wastage of water avoided.</p> <p>Following the MLA's aggressive stand, the Water Resources Department has announced a schedule for releasing water into the canals, which has given great relief to thousands of farmers.</p>"
    },
    "14": {
      "title": "‘Lokmangal Education Complex and Competitive Exam Centre’: Free Library and Career Guidance for Meritorious Rural Students",
      "author": "Education Correspondent",
      "excerpt": "A state-of-the-art digital library and free guidance sessions by expert officers have begun for aspiring rural youth preparing for MPSC, UPSC and police recruitment.",
      "content": "<p><strong>Solapur:</strong> For rural youth who dream of higher education but fall behind because of financial difficulties, the competitive exam centre of Lokmangal Shikshan Prasarak Mandal is proving a guiding beacon.</p> <p>The centre provides free Wi-Fi, more than 5,000 reference books, an air-conditioned study room and online test series. A special workshop by successful civil servants and professors is held every Sunday.</p> <p>Over the past year, more than 40 students from this centre have succeeded in government service and the police force, justifying Lokmangal's educational service.</p>"
    },
    "15": {
      "title": "Grand Youth Workers' Meet in South Solapur Taluka; MLA Subhash Deshmukh's Appeal: ‘Solving the Problems of Ordinary Citizens Is Our Real Strength’",
      "author": "Youth Forum Bureau",
      "excerpt": "At a grand meet organised by the Bharatiya Janata Yuva Morcha, MLA Subhash Bapu Deshmukh called on the youth to take the lead in social work and nation-building.",
      "content": "<p><strong>Solapur:</strong> MLA Subhash (Bapu) Deshmukh guided the youth at the youth workers' meet held in the presence of thousands of young people from South Solapur taluka. “The young generation is the future of the country. Politics is not merely for power; it is an effective medium of social service,” he said.</p> <p>On the occasion, Deshmukh announced that a special help desk would be started to take the benefits of the government's skill development schemes, Mudra loans and start-up schemes to the aspiring young person in every village.</p>"
    },
    "16": {
      "title": "‘Lokmangal Urban Cooperative Bank’: Launch of the ‘Easy Agriculture and Business Loan’ Scheme for Farmers and Low-Income Families",
      "author": "Financial Correspondent",
      "excerpt": "To free ordinary farmers, small traders and women entrepreneurs from the clutches of moneylenders, Lokmangal Urban Cooperative Bank has started a quick-loan scheme at very low interest rates.",
      "content": "<p><strong>Solapur:</strong> Lokmangal Urban Cooperative Bank, which empowers ordinary people financially through cooperation, has brought a special ‘Easy Agriculture and Business Loan’ scheme into effect at all its branches.</p> <p>With minimal paperwork and a quick approval process, small shopkeepers in rural areas, young people running farm-related businesses and farmers will get great support from this scheme. Transparent banking and customer-oriented service are the identity of Lokmangal Bank.</p>"
    },
    "17": {
      "title": "Blog: ‘Society's Mind in the Digital Age and the Changing Nature of Reading Culture’",
      "author": "Prof. Dr. Prakash Joshi",
      "excerpt": "In the crowd of social-media reels and short videos, is deep reading and reflection fading away? A well-known thinker and writer's intellectual churning on this question.",
      "content": "<p>The human brain is bearing an enormous barrage of information. But we are forgetting that information is not knowledge. In today's times, books, newspapers and thoughtful blogs are the means of keeping our discernment awake.</p>"
    },
    "18": {
      "title": "Blog: ‘Local Self-Government Bodies and the Rights of Ordinary Citizens’",
      "author": "Adv. Mahesh Desai",
      "excerpt": "How can you ask the municipal council or gram panchayat to account for development work and for the civic problems in your area? Learn to use the Right to Information Act properly.",
      "content": "<p>Local self-government bodies are the first step of democracy. It is extremely important for citizens to be alert about the basic rights to roads, water, sanitation and health.</p>"
    }
  },
  "weekly": {
    "1": {
      "title": "Samruddha Gaon Abhiyan to Be Implemented Effectively",
      "desc": "MLA Subhash Bapu Deshmukh: Snehsamvad (friendly interaction) held at Sangola. Sangola: Former Cooperation Minister of the state and current South Solapur MLA Subhash Bapu Deshmukh stated that the Samruddha Gaon Abhiyan will be implemented effectively, with everyone's cooperation and participation, to restore Solapur district's lost glory. He was speaking at the Snehsamvad programme organised at Sangola."
    },
    "2": {
      "title": "Solapur Rural East | Membership Drive Workshop",
      "desc": "A membership drive workshop of the Bharatiya Janata Party, Solapur Rural (East), was held at Shivsmarak. All workers should take an active part in the membership drive and plan booth by booth to strengthen the organisation."
    },
    "3": {
      "title": "Mahayuti Government Approves Survey of the Bhima–Sina Link Canal!",
      "desc": "A success for our demand and persistent follow-up! The persistent follow-up for the Bhima–Sina river-linking project has borne fruit. The Mahayuti government has approved the survey of the Bhima–Sina link canal. In the coming period, my effort will be to take this project to completion soon."
    },
    "4": {
      "title": "Faith and Patience… the BJP's Great Leap",
      "desc": "The BJP's grand-victory state convention was held with enthusiasm at Shirdi. MLA Subhash Bapu Deshmukh was present there. The party's upcoming schemes were discussed at the convention."
    },
    "5": {
      "title": "Aranyarishi Maruti Chitampalli",
      "desc": "Aranyarishi Hon. Shri Maruti Chitampalli has recently been awarded the Padma Shri. On this occasion MLA Subhash Bapu Deshmukh paid a courtesy visit to his residence and extended his good wishes. Through close observation of animals, birds, trees and flowers, he has given Marathi literature an invaluable treasure of nature."
    },
    "6": {
      "title": "Positive and In-Depth Discussion on the Growth of the IT Sector in Solapur",
      "desc": "A special meeting for the growth of the IT sector in Solapur was organised at Grey Knight Services, Nehru Nagar, in the presence of MLA Subhash Bapu Deshmukh. At this meeting of Solapur's IT entrepreneurs, problems and challenges in the IT industry were discussed in depth."
    },
    "7": {
      "title": "Instructions to Survey the Bhima and Sina Rivers for Barrages",
      "desc": "Water Resources Minister Radhakrishna Vikhe-Patil; report sought by 30 April. Solapur: On the lines of the barrages on the Godavari river, conduct a survey to build new barrages on the Bhima and Sina rivers in Solapur district and submit the report by 30 April — such were the instructions given by Water Resources Minister Radhakrishna Vikhe Patil. He has also ordered that proposals for building flood-protection ghats be submitted urgently."
    },
    "8": {
      "title": "Tribute Programme on the 395th Birth Anniversary of Chhatrapati Shivaji Maharaj and Welcome of the Palkhi Procession Held",
      "desc": "On the occasion of the 395th birth anniversary of Chhatrapati Shivaji Maharaj, at the main branch of Lokmangal Bank, a garland was offered to the statue of Chhatrapati Shivaji Maharaj and the mahapuja was performed by the bank's chairman, MLA Subhash Bapu Deshmukh."
    },
    "9": {
      "title": "Cooperation Takes a Village Towards Prosperity – MLA Subhash Bapu Deshmukh",
      "desc": "On the occasion of the International Year of Cooperatives 2025, a one-day workshop was organised for the chairmen, secretaries and boards of directors of various executive service cooperative societies in South Solapur and North Solapur talukas. MLA Subhash Bapu Deshmukh attended the workshop and guided the participants. He expressed the view that a single cooperative society can change the picture of a village, and that a village moves towards prosperity only through cooperation."
    },
    "10": {
      "title": "Issue Raised in the Assembly About the Dr. Babasaheb Ambedkar Krishi Swavalamban Yojana",
      "desc": "The Dr. Babasaheb Ambedkar Krishi Swavalamban Yojana, an ambitious scheme of the state government, is not being implemented in metropolitan regions or in the surrounding 5 km area. But many nagar panchayats and municipal councils in the state are in financial distress, and no trade takes place there."
    },
    "11": {
      "title": "MLA Subhash Deshmukh Holds Meeting at the Industries Minister's Office on Reviving the Mandrup MIDC",
      "desc": "An important meeting was held at the Industries Minister's office on many pending matters of the industries department in South Solapur taluka. At this meeting MLA Subhash Bapu Deshmukh held detailed discussions on various subjects, including the revival of the MIDC at Mandrup in South Solapur taluka, setting up a logistics park at Hotgi and providing basic facilities in the MIDC."
    },
    "12": {
      "title": "Solve the Problems of Government Schools Urgently – MLA Subhash Deshmukh",
      "desc": "Many problems related to school education are pending in South Solapur taluka, because of which students are being deprived of education. Against this background, MLA Subhash Bapu Deshmukh drew the attention of the House by raising various issues related to the education department in the legislature."
    },
    "13": {
      "title": "‘One State, One Uniform’ Decision Withdrawn by the State Government!",
      "desc": "Success for the follow-up! The ‘One State, One Uniform’ decision had brought a financial crisis on 15,000 workers in Solapur, and the garment industry was in trouble. Taking note of this, MLA Subhash Bapu Deshmukh made continuous efforts with the office-bearers of the garment association before the government. MLA Subhash Bapu's efforts have succeeded, and the state government has withdrawn this decision."
    },
    "14": {
      "title": "Will Make South Solapur the Top Constituency in the District in Tree Planting: MLA Subhash Deshmukh",
      "desc": "Meeting at Siddheshwar Vanvihar on tree plantation and developing a tourist spot. Solapur: MLA Subhash Deshmukh has resolved to make the whole southern taluka green. As part of this, he held a meeting with officials at Siddheshwar Vanvihar on tree planting and developing a tourist spot in South Solapur taluka."
    },
    "15": {
      "title": "Bhoomipujan of the Widening Work of Asra Bridge Held",
      "desc": "North Solapur: A decision has been taken to widen the Asra Bridge, which stands at a location extremely important for Solapur city's traffic system but is in a narrow condition, and the work is being taken up with a fund of about ₹32.80 crore. The bhoomipujan of this work was performed at the auspicious moment of Akshaya Tritiya by MLA Subhash Bapu Deshmukh."
    },
    "16": {
      "title": "Solapur Delegation Visits Texmaas Organisation in Dubai",
      "desc": "Dubai: Under the ‘Solapur–Dubai Business Delegation’ organised by Solapur Social Foundation and the Udyam PAHSUI Foundation of Solapur University, a high-level Solapur delegation led by MLA Subhash Bapu Deshmukh paid a courtesy visit to Texmaas – Textile Merchants Group in Dubai Textile City. The organisation represents more than 400 textile companies."
    },
    "17": {
      "title": "Solapur Entrepreneurs' Dubai Tour",
      "desc": "Concept and guide: MLA Subhash Bapu Deshmukh, Founder President, Solapur Social Foundation. Dubai: An educational and industrial delegation from Solapur district, led by MLA Subhash Bapu Deshmukh, made a study visit to the Sharjah Research Technology and Innovation Park (SRTIP) in Sharjah, Dubai. During the tour, various opportunities for innovation, research and international cooperation for Solapur district were studied."
    },
    "18": {
      "title": "A New Business Platform in Dubai for Solapur's Entrepreneurs",
      "desc": "Solapur: An initiative has been taken to create a special business platform in Dubai, with the aim of giving the entrepreneurs of Solapur district opportunities for trade at the international level. Under this initiative, a delegation of Solapur's entrepreneurs, led by MLA Subhash Bapu Deshmukh, went on a Dubai tour. A special press conference was organised to give information about this tour."
    },
    "19": {
      "title": "Positive Discussion with Agriculture Minister Manikrao Kokate on Innovative Agricultural Projects…",
      "desc": "Mumbai: At the Mantralaya, MLA Subhash Bapu Deshmukh held detailed and positive discussions with the state's Agriculture Minister Manikrao Kokate about the long-pending demands of farmers and villagers of the South Solapur Assembly constituency. Concrete decisions were taken on various important subjects in the discussion, and this step will prove decisive for the welfare of farmers."
    },
    "20": {
      "title": "Solapur's Dream Comes True; Solapur–Goa Flight Service Begins…!",
      "desc": "Solapur: Union Minister of State for Civil Aviation Murlidhar Mohol inaugurated the regular ‘Solapur to Goa’ flight service from Solapur airport through the airline ‘Fly91’. Through this flight service, the many-year-old dream of the people of Solapur has come true today, and it is truly an important milestone in the history of Solapur district."
    },
    "21": {
      "title": "Launch of Distribution of One Lakh Notebooks by Lokmangal Foundation",
      "desc": "Solapur: For this academic year 2025–26, Lokmangal Foundation has set a target of distributing one lakh notebooks in various schools in the city. It was launched from Friday. On the first day, notebooks were distributed in 7 schools."
    },
    "22": {
      "title": "Meeting on Various Pending Water Resources Matters of ‘South Solapur’…",
      "desc": "Mumbai: A meeting on various pending matters of the South Solapur constituency was held at the Mantralaya in the presence of Maharashtra's Water Resources Minister Radhakrishna Vikhe-Patil. At this meeting MLA Subhash Bapu Deshmukh held positive discussions on the various pending matters, and concrete steps have been taken."
    },
    "23": {
      "title": "Follow-up Succeeds; Ujani Dam Water Released into Dhubdhubi Lake",
      "desc": "Dhubdhubi Lake, Shirwal: The continuous follow-up by MLA Subhash Bapu Deshmukh to have Ujani Dam water released into the Dhubdhubi lake at Shirwal in South Solapur taluka has succeeded, and water has been released into this lake from the Ujani Dam. With water released into this lake, thousands of farmers in the villages of Shirwal, Kanbas and Ingalgi will get great relief for the kharif season."
    },
    "24": {
      "title": "Follow-up Succeeds; Ujani Dam Water Released into Dhubdhubi Lake",
      "desc": "Dhubdhubi Lake, Shirwal: The continuous follow-up by MLA Subhash Bapu Deshmukh to have Ujani Dam water released into the Dhubdhubi lake at Shirwal in South Solapur taluka has succeeded, and water has been released into this lake from the Ujani Dam. With water released into this lake, thousands of farmers in the villages of Shirwal, Kanbas and Ingalgi will get great relief for the kharif season."
    },
    "25": {
      "title": "Come, Let's Unite and Take Solapur's Tourism Strengths to the World!",
      "desc": "Solapur: A planning review meeting for the Solapur District Tourism Week 2025, organised on the initiative of Solapur Social Foundation, was held in an enthusiastic atmosphere. Several important decisions were taken at the meeting for the tourism development of the district. They include special activities to attract outside tourists, a grand tourism rally, and cleanliness drives in every village."
    },
    "26": {
      "title": "Inspection Tour at Various Places in Solapur City…!",
      "desc": "Solapur: To review various civic problems and development works of Solapur city, MLA Subhash Bapu Deshmukh visited different parts of the city along with Solapur Municipal Corporation Commissioner Sachin Ombase. During this on-the-spot inspection tour he learned about citizens' difficulties and discussed immediate remedial measures with the concerned officials."
    },
    "27": {
      "title": "One Day for Solapur...",
      "desc": "MLA Subhash Deshmukh's appeal to the people of Solapur — public participation is essential; an invitation to the in-laws of Solapur's daughters and the parental families of its daughters-in-law… Solapur: Since Solapur's development cannot happen easily without the initiative of the people of Solapur, they should give one day for Solapur, and every family in the city and district should happily take part in the Solapur Tourism Festival to be celebrated from 27 September to 2 October."
    },
    "28": {
      "title": "Inspection of Ujani Dam!",
      "desc": "Ujani Dam: MLA Subhash Bapu Deshmukh visited the Ujani Dam area, a boon for Solapur district, and inspected the dam premises. The dam has filled to 100 per cent this year, which is a very positive matter for Solapur district's water supply. In this connection he held detailed discussions with the concerned officials about the future water planning of Solapur district."
    },
    "29": {
      "title": "Solapur District Tourism Festival 2025",
      "desc": "A unique confluence of history, culture, nature and tradition. From 27 September, World Tourism Day, to 2 October, Mahatma Gandhi Jayanti. Come, let's take part… let's celebrate a new festival of tourism!"
    },
    "30": {
      "title": "Solapur's Wait Is Over; Flights to Bengaluru Along with Mumbai Now Begin!",
      "desc": "On the initiative of Maharashtra's successful Chief Minister Hon. Shri Devendra Fadnavis and Union Minister of State for Civil Aviation Hon. Shri Murlidhar Mohol, direct flight services Solapur–Mumbai and Solapur–Bengaluru are starting from Solapur airport from 15 October. This service will make travel easier, faster and more convenient for devotees."
    },
    "31": {
      "title": "Inspection Tour of Flood-Hit Villages in South Solapur Taluka…!",
      "desc": "Heavy rain in Hattur, Wadakbal, Honmurgi, Birnal, Aurad, Mangoli, Akole and Mandrup — villages on the banks of the Sina river in South Solapur taluka — has caused enormous damage to crops, orchards and houses. MLA Subhash Bapu Deshmukh therefore made a personal visit and inspected the damage. During the inspection he interacted with farmers and learned about their difficulties and urgent needs."
    },
    "32": {
      "title": "Mahayuti Government's Relief for Farmers Affected by Heavy Rain!",
      "desc": "Farmers have suffered immense losses because of the heavy rain in the state over the past few days. Ordinary citizens along with farmers have also been hit hard by this heavy rain, and many people have fallen into financial distress. The Mahayuti government has announced a relief package of about ₹31,000 crore for the state's farmers."
    },
    "33": {
      "title": "Give Justice to the Solapur People Affected by Heavy Rain!",
      "desc": "Solapur: When Chief Minister Hon. Shri Devendra Fadnavis came to Solapur city to inaugurate the Mumbai–Solapur flight service, MLA Subhash Bapu Deshmukh held detailed discussions with him about the serious situation created in Solapur district by the recent heavy rain. Farmland, crops, roads and property have suffered extensive damage because of the heavy rain and flood conditions."
    },
    "34": {
      "title": "A Look at the Future and Development of Malegaon – Symposium",
      "desc": "Malegaon, Barshi: At this special programme organised at Malegaon in Barshi taluka, MLA Subhash Bapu Deshmukh attended and interacted with local villagers about the ‘Samruddha Gaon – Malegaon’ concept. On the occasion, tributes were paid to Sardar Vallabhbhai Patel, the architect of modern India, the Iron Man and Bharat Ratna, on his birth anniversary."
    },
    "35": {
      "title": "Bhoomipujan of Various Development Works at Hattur!",
      "desc": "Hattur, South Solapur: Development works worth a total of ₹3 crore 75 lakh were inaugurated at the Shri Someshwar and Bansiddheshwar Temple Devasthan at Hattur in South Solapur taluka by the state's Rural Development and Panchayat Raj Minister and Guardian Minister of Solapur district Jaykumar Gore. On the occasion, the Guardian Minister assured all possible help."
    },
    "36": {
      "title": "Bhoomipujan of Various Development Works at Salgar Vasti!",
      "desc": "Salgar Vasti, South Solapur: The bhoomipujan and inauguration of important road concreting works sanctioned under the Maharashtra Suvarna Jayanti Abhiyan (district level) scheme in the Salgar Vasti area of South Solapur taluka were performed by MLA Subhash Bapu Deshmukh."
    },
    "37": {
      "title": "52 Couples Tie the Knot at Lokmangal's Wedding Ceremony",
      "desc": "The district tourism theme made the ceremony the centre of attraction. Spiritual leaders (Maharajs) were present to bless the brides and grooms. Solapur: At the inter-faith community wedding ceremony organised by Lokmangal Foundation on the evening of Sunday, 16 November 2025, 52 couples arrived on the stage in silk and, in the presence of thousands, were bound in the silken knot of marriage. This grand ceremony was held, through the inspiration of MLA Subhash Deshmukh, at the Shivaji Adhyapak Vidyalaya (D.Ed. College) ground on Vijapur Road."
    },
    "38": {
      "title": "Inauguration of the ‘9th International Uniform Manufacturers Fair 2025’!",
      "desc": "Mumbai: MLA Subhash Bapu Deshmukh was present as chief guest at the grand 9th International Uniform Manufacturers Fair – 2025 exhibition, organised by the Solapur Garment Manufacturers Association (SGMA) at the NESCO Exhibition Centre in Mumbai. The exhibition was inaugurated by Maharashtra Legislative Assembly Speaker Shri Rahul Narwekar. More than 150 national and international brands are participating in the fair."
    },
    "39": {
      "title": "Inauguration of Various Development Works of the Tourism Centre at Hotgi!",
      "desc": "Hotgi, South Solapur: The bhoomipujan and inauguration of various development works for the all-round development of the tourism centre at Hotgi in South Solapur taluka were performed by MLA Subhash Bapu Deshmukh. A total fund of ₹2 crore has been sanctioned for these works."
    },
    "40": {
      "title": "Inauguration of ‘Lokmangal Sanjeevani Medical’ at Jule Solapur!",
      "desc": "Jule Solapur: The grand launch of the free ‘Lokmangal Sanjeevani Medical’, which will be a major support for the citizens of Solapur district, was performed by MLA Subhash Bapu Deshmukh. Making healthcare available to ordinary citizens in an easy, accessible and affordable form is the need of the hour."
    },
    "41": {
      "title": "BJP Tops in the Local Self-Government Bodies!",
      "desc": "I sincerely thank all the voters for the overwhelming support the people gave to the Bharatiya Janata Party's candidates in the municipal council, nagar panchayat and municipality elections held in Maharashtra. The election of the largest number of BJP councillors in these elections is the people's vote of confidence in the party's development-oriented policies, transparent governance and work in the public interest."
    },
    "42": {
      "title": "Lokmangal Employees' Snehsamvad Meeting Held with Enthusiasm",
      "desc": "The employees' Snehsamvad meeting organised by the Lokmangal family was held with great enthusiasm at The Heritage Lawns in Solapur. The programme had the chief presence of the Lokmangal family's founder-president, MLA Subhash Deshmukh. He said that the welfare and progress of employees is his foremost priority."
    },
    "43": {
      "title": "A Festival of Democracy, of Solapur's Development!",
      "desc": "Ahead of the Solapur Municipal Corporation election, MLA Subhash Bapu Deshmukh was present with his family at Little Flower High School on Hotgi Road and exercised his sacred right to vote. For every citizen to vote is the real responsibility in order to strengthen democracy."
    },
    "44": {
      "title": "The Need for Modern Technology in Farming!",
      "desc": "Mandrup: The inauguration of the agriculture exhibition organised on the occasion of the Shri Malsiddha Yatra at Mandrup in South Solapur taluka was held with enthusiasm. On the occasion it was noted that traditional farming is becoming expensive these days and income does not match expenses."
    },
    "45": {
      "title": "Public Meeting for the Zilla Parishad–Panchayat Samiti Election Campaign!",
      "desc": "Kandalgaon: A grand public meeting was organised at Kandalgaon for campaigning ahead of the Zilla Parishad and Panchayat Samiti general elections. At the meeting MLA Subhash Bapu Deshmukh interacted directly with the villagers present and appealed to them to make the Bharatiya Janata Party win with a huge majority in the coming elections. He also said that through the BJP, the development of basic facilities such as roads, water supply, electricity, health and education in rural areas has gathered speed so far."
    },
    "46": {
      "title": "A New Chapter in Dubai–Solapur Industrial Friendship!",
      "desc": "Joint efforts are needed for the district's development: MLA Subhash Deshmukh — inauguration of the new office of Consistent Engineering Consultants at Jule Solapur. Solapur: MLA Subhash Deshmukh stated that a new bond of industrial friendship has begun between Dubai and Solapur, and that efforts to increase industry, investment and employment are continuing so that Solapur district may prosper. He also made it clear that efforts are on to market Solapur's garment industry and other local products globally."
    },
    "47": {
      "title": "₹25 Crore Fund for South Solapur Taluka",
      "desc": "Solapur: A fund of ₹25 crore has been sanctioned from the state budget for various development works in the South Solapur Assembly constituency. MLA Subhash Deshmukh said that this fund will speed up the works on roads, bridges and infrastructure in the constituency."
    },
    "48": {
      "title": "The Need to Give Farmers Support and Respect: MLA Subhash Deshmukh",
      "desc": "Lokmangal Pratham Krishi state-level awards presented in grand style. Solapur: Every institution and political leader needs to come forward to support and honour farmers. If a group of prosperous farmers is created in the state, the state and the country will move on the path of progress. It is necessary for young people to work well in the farming profession and increase agricultural production, said Lokmangal Group chairman MLA Subhash Deshmukh."
    },
    "49": {
      "title": "The Book Is the Main Carrier of Knowledge, Thought and Culture",
      "desc": "Ashish Shelar: Lokmangal Literary Awards presented. Solapur: Books are the most important means of passing human knowledge, thought and culture from one generation to the next. A book is the true companion for living a complete life, and anyone who wants to understand their life should turn to literature, said the state's Information Technology and Cultural Affairs Minister Ashish Shelar."
    },
    "50": {
      "title": "Launch of Beautification of the Historic Shrimant Bajirao Peshwa Well at Bhandishegaon!",
      "desc": "Bhandishegaon: The beautification work at the historic Shrimant Bajirao Peshwa well at Bhandishegaon (Tal. Pandharpur) was launched by MLA Subhash Bapu Deshmukh in an enthusiastic and devotional atmosphere. Situated on the sacred palkhi route of Dehu–Alandi–Pandharpur, this ancient stepwell (barav) is an extremely important place of faith for the Warkari sect."
    },
    "51": {
      "title": "7 Couples Wed at the Community Wedding Ceremony at Borul in the Presence of Thousands of Guests!",
      "desc": "Solapur: The community wedding ceremony organised by Lokmangal Foundation at Borul in South Solapur taluka on the occasion of Ahilyadevi Holkar's birth anniversary was held with great enthusiasm and splendour according to traditional rites. This was the fourth consecutive community wedding ceremony this year, in which 7 couples were married."
    },
    "52": {
      "title": "After Lokmangal, the Foundation Stone of Vishwamangal; Marathi Entrepreneurs to Be Strung on One Thread",
      "desc": "To enable the youth of Solapur to benefit from the government's Jalyukt Shivar, Mudra Yojana and Startup India, we have been working in Solapur district through ‘Lokmangal’ for so long. But now, to extend the scope of this work across Maharashtra and to make villages self-reliant by building a chain of Maratha brothers scattered across the world, Solapur South MLA and former Cooperation Minister Subhash Deshmukh has taken the initiative through the Vishwamangal Marathi Foundation."
    },
    "53": {
      "title": "Courtesy Visit by Chief Minister Hon. Shri Devendra Fadnavis!",
      "desc": "Solapur: Chief Minister Hon. Shri Devendra Fadnavis paid a courtesy visit to MLA Subhash Bapu Deshmukh's residence in Solapur. On the occasion, MLA Deshmukh warmly welcomed the Chief Minister and honoured him respectfully. On this occasion he held detailed and positive discussions with him on various local development works, pending issues and the all-round progress of the district."
    },
    "54": {
      "title": "Courtesy Call on Union Minister Nitin Gadkari in Delhi!",
      "desc": "Delhi: MLA Subhash Bapu Deshmukh paid a courtesy call on Union Road Transport and Highways Minister Nitin Gadkari to thank him for sanctioning ₹740.38 crore for the development of the 81.37 km Mohol – Basavnagar (Tera Mile) – Valsang road under NH-465, which will boost the development of connectivity and infrastructure in Solapur district."
    },
    "55": {
      "title": "Lokmangal Foundation's 48th Community Wedding Ceremony Held with Enthusiasm at Dharashiv",
      "desc": "11 couples married! The 48th community wedding ceremony organised by Lokmangal Foundation was held with enthusiasm at Dharashiv. At this ceremony 11 Hindu couples were joined in matrimony. The wedding was attended by thousands of guests along with dignitaries from various fields. Lokmangal Foundation started the tradition of community weddings in 2006, and this year the initiative has completed 20 years."
    },
    "56": {
      "title": "Dialogue with Eminent Persons from the Cultural Field on Building a Theatre in Solapur!",
      "desc": "Solapur: MLA Subhash Bapu Deshmukh held detailed discussions with various stage actors, directors, sound–light experts and eminent persons from the cultural field of Solapur regarding the construction of the proposed theatre at Jule Solapur. At the meeting, the artists expressed the expectation that a high-quality theatre with state-of-the-art facilities, giving fresh strength to the cultural movement, be built in Solapur too."
    },
    "57": {
      "title": "Spontaneous Response to the Lokmangal Family's Bal Sanskar Camp",
      "desc": "A residential Bal Sanskar camp organised by Solapur Social Foundation and Lokmangal Foundation was held at Wadala. Its inauguration ceremony was held with great enthusiasm in the presence of MLA Subhash Bapu Deshmukh. More than 150 students are taking part in the camp. The camp began with an aarti at the Ram Mandir in the Lokmangal College premises."
    },
    "58": {
      "title": "‘Let Us Help One Another, and All Become Prosperous’: Grand Start of Vishwamangal Marathi Business Forum – Pandharpur",
      "desc": "Pandharpur: The Vishwamangal Marathi Business Forum – Pandharpur was launched in an enthusiastic atmosphere through the Vishwamangal Marathi Foundation, in the presence of MLA Subhash Bapu Deshmukh. The forum was started with the motto “Let us help one another, and all become prosperous”, with the aim of bringing Marathi professionals together. The main purpose behind the forum is to encourage rural-level businesses and bring professionals together."
    },
    "59": {
      "title": "Guidance Workshop on Modern Orchard Management and Marketing Skills for Mango Growers Held!",
      "desc": "Solapur: MLA Subhash Bapu Deshmukh inaugurated the special guidance workshop for mango-growing farmers, organised at Solapur jointly by the Agriculture Department Solapur, ATMA Solapur, Mahadesh Farmer Producer Company Limited and Vijayraj Kesar Mango Farm. At the workshop, experts gave detailed guidance on mango cultivation methods, pruning, thinning, orchard management and modern technology for increasing production."
    },
    "60": {
      "title": "Follow-up in the Vidhan Bhavan for South Solapur's Water Resources Issues!",
      "desc": "Vidhan Bhavan, Mumbai: During the monsoon session of the Maharashtra Legislature, MLA Subhash Bapu Deshmukh paid a courtesy call on Water Resources Minister Radhakrishna Vikhe Patil at the Vidhan Bhavan. During the meeting he held detailed discussions on various pending and important matters of the Water Resources Department in the South Solapur Assembly constituency. On this occasion he submitted a representation on irrigation projects, water conservation works, water availability and the various development works of the Water Resources Department in the constituency and requested necessary action."
    },
    "61": {
      "title": "South Solapur's Irrigation Issues to Gain Momentum!",
      "desc": "Mantralaya, Mumbai: A detailed review meeting on various pending Water Resources Department matters of the South Solapur Assembly constituency was held at the Mantralaya under the chairmanship of Water Resources Minister Radhakrishna Vikhe-Patil. At the meeting MLA Subhash Bapu Deshmukh held detailed discussions on bunds and barrages on the Sina and Bhima rivers, the link canal, the Degaon canal, strengthening of lakes, flood-prevention works, irrigation facilities, land acquisition, road repairs and various demands of farmers."
    },
    "62": {
      "title": "Marathi Entrepreneurs Should Unite and Come Forward for Industrial Growth: MLA Subhash Bapu Deshmukh",
      "desc": "Spontaneous response to the Business Self-Employment Dialogue Meeting of Vishwamangal Marathi Foundation. Itkal: The ‘Business Self-Employment Dialogue Meeting’ organised by the industry wing of Vishwamangal Marathi Foundation was held with enthusiasm at Itkal (Tal. Tuljapur, Dist. Dharashiv) in the presence of MLA Subhash Bapu Deshmukh. An entrepreneur must cultivate the attitude of seeing every crisis as an opportunity. If a business is built with consistency, study, new ideas and attention to society's needs, success is certain, he said."
    },
    "63": {
      "title": "Welcome in Pandhari for the ‘Global Wari’ from London to Pandharpur!",
      "desc": "Pandharpur: On the sacred occasion of Ashadhi Ekadashi, the ‘Global Wari’ from London to Pandharpur arrived at Pandhari. On this occasion, on behalf of the Vishwamangal Marathi Foundation, MLA Subhash Bapu Deshmukh welcomed Warkari devotees who came from various countries at Vasantrao Kale College in Wadi Kuroli. He remarked that Marathi people and Warkaris from around the world are coming together and giving a message of devotion, culture and Marathi pride."
    },
    "64": {
      "title": "Cheque for ₹10 Lakh Handed Over to the Wife of Late Employee Ramesh Bankat Dattu",
      "desc": "Lokmangal Co-operative Bank's exemplary employee welfare initiative. Ramesh Bankat Dattu, an employee at the Mangalvedha branch of Lokmangal Co-operative Bank Ltd., Solapur, passed away suddenly. At this difficult time, upholding its employee welfare policy, the bank handed over a cheque of ₹10 lakh under the bank's term policy insurance scheme to the late employee Ramesh Bankat Dattu's wife, Smt. Supriya Dattu, giving the family financial support. The cheque was handed over by the bank's chairman, MLA Subhash Bapu Deshmukh."
    },
    "65": {
      "title": "Spontaneous Participation in Vishwamangal Marathi Foundation's ‘Samvad Melava 2026’!",
      "desc": "Pune: MLA Subhash Bapu Deshmukh attended the ‘Samvad Melava 2026’ programme of the Vishwamangal Marathi Foundation, held at the Residency Club in Pune. Entrepreneurs, professionals, educationists and social workers from various fields, as well as the Foundation's office-bearers and members, were present in large numbers. The Foundation's upcoming course was discussed on the occasion."
    },
    "66": {
      "title": "Positive Discussion with Hon. Devendra Fadnavis on Solapur's Development Works",
      "desc": "Mumbai: MLA Subhash Bapu Deshmukh paid a courtesy call on Maharashtra Chief Minister Devendra Fadnavis at the ‘Varsha’ official residence in Mumbai. During the meeting he held detailed and positive discussions on various important subjects linked to the all-round development of Solapur district. These included the Bhima–Sina link canal project, development of the Kudal Sangam pilgrimage site, a new bus stand at Mandrup, an IT park at Hotgi, and a modern theatre at Jule Solapur."
    },
    "67": {
      "title": "Let's Realise the Concept of ‘Local to Global, Global to Local’ Through Entrepreneurs' Unity: MLA Subhash Bapu Deshmukh",
      "desc": "Inauguration of Vishwamangal Marathi Foundation's Solapur Business Forum; appeal to set up at least 20 forums in the district. Solapur: The Solapur Business Forum of Vishwamangal Marathi Foundation was started with the aim of bringing Marathi entrepreneurs together and giving them new business opportunities, a wider market and a strong business network. At the inauguration, MLA Subhash Bapu Deshmukh appealed to entrepreneurs to come together and grow business through mutual cooperation."
    },
    "68": {
      "title": "Minister Dadaji Bhuse Holds Meeting on Repair of Schools!",
      "desc": "Mantralaya, Mumbai: MLA Subhash Bapu Deshmukh met state School Education Minister Dadaji Bhuse and held detailed discussions on the important demand that Zilla Parishad schools affected by the flood situation in Solapur district be repaired and developed. On this occasion he requested urgent repair of the affected schools and the provision of necessary facilities for students."
    }
  }
};
