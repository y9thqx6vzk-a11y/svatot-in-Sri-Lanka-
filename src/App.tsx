import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, Calendar, BookOpen, Users, Phone, Menu, X, 
  CreditCard, Wifi, Sun, Utensils, Camera, ArrowRight,
  Leaf, Sparkles, Loader2, Globe, Upload, Mail
} from 'lucide-react';

// --- Gemini API Setup (Moved to Backend) ---
async function callGemini(prompt: string, systemInstruction = "") {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.text || "Error generating content.";
  } catch (error) {
    console.error("Backend API Error:", error);
    return "Error communicating with server.";
  }
}

// --- תוכן האתר (מילון שפות) ---
const contentData = {
  he: {
    nav: {
      home: 'בית',
      itinerary: 'המסלול',
      essentials: 'מידע חשוב',
      discovery: 'מגלים עולם',
      about: 'הסיפור שלנו',
      register: 'הצטרפו למסע',
      toggle: 'Switch to English'
    },
    hero: {
      title: 'סבתות בסרי לנקה\nקיץ 2026',
      subtitle: 'חוויה ייחודית ובלתי נשכחת המיועדת בלעדית לאימהות וסבתות. המסע יתאפיין בקצב רגוע, רגעים מרגשים וקסם מקומי עם דגש על טבע, הרפתקאות, חברות וחוף הים.',
      tagline: '10 ימים מדהימים | מחנה הקיץ שלכן אחרי הילדים/נכדים, טיול של פעם בחיים',
      cta_plan: 'צפו בתוכנית',
      cta_discover: 'גלו עוד'
    },
    features: {
      title: 'טיול של פעם בחיים',
      f1_title: 'קולינריה כשרה',
      f1_desc: 'מרכיבים טריים ומקומיים מוכנים בסטנדרטים של כשרות. הזדמנות ייחודית לחוות את המטבח המקומי המדהים.',
      f2_title: 'תרבות אותנטית',
      f2_desc: 'מספארי ועד מטעי תה וטיולי זריחה, תזכו לראות את סרי לנקה האמיתית.',
      f3_title: 'וולנס ויוגה',
      f3_desc: 'תרגולי יוגה עדינים בזריחה או בשקיעה, מותאמים לכל הרמות למתיחת הגוף והרגעת הנפש.'
    },
    gallery: {
      title: 'לחוות את הקסם',
      desc: 'ממפלים עוצרי נשימה ועד מטעי תה מרהיבים והחופים המוזהבים של ארוגם ביי, תזכו לראות את כל הפלאים של סרי לנקה.',
      cta: 'למידע נוסף / שריינו מקום'
    },
    itinerary: {
      title: 'ההרפתקה המתוכננת שלכן',
      subtitle: 'המסלול',
      days: [
        { day: 'ימים 1 - 3', title: "הגעה וסיגיריה", desc: "נחיתה בקולומבו ונסיעה לאוויר ההרים הקריר של סיגיריה. התארגנות, טיפוס על סלע האריה המפורסם, וסיור בכפר המקומי. ספארי פילים, רפטינג, קניונינג או טיול ביער הגשם." },
        { day: 'ימים 4 - 5', title: "אלה וארץ התה", desc: "טיפוס זריחה לפסגת אדם הקטנה, והכנה לנסיעה ברכבת המפורסמת. ביקור בגשר תשע הקשתות וטעימות תה ציילוני במטעים הירוקים. מפלים עוצרי נשימה ונופים מדהימים באומגה." },
        { day: 'ימים 6 - 8', title: "ארוגם ביי", desc: "נסיעה לארוגם ביי והתארגנות בדירות הבוטיק על החוף. גלישה או שיעורי גלישה, סיור בלגונות, טיפוס על סלע הפיל בזריחה, ספארי, זמן חוף, ספא ושופינג. אוכל מקומי אותנטי.\n\nשבת על החוף." },
        { day: 'יום 9', title: "קסם האוקיינוס", desc: "שנורקלינג במים הצלולים, צפייה באלמוגים וחיים ימיים. מסאז', קניות מזכרות וזמן בעיירה המקומית." },
        { day: 'יום 10', title: "חזרה הביתה", desc: "טיול זריחה בסלע הפיל, אריזות ונסיעה לשדה התעופה. חוזרים הביתה לשתף את החוויות משנות החיים עם המשפחה." },
      ]
    },
    essentials: {
      title: 'מידע חשוב - טוב לדעת',
      subtitle: 'כל מה שצריך לדעת לפני שאורזים מזוודה.',
      ai_title: 'מה לארוז? שאל את המומחה',
      ai_desc: 'ספר לנו קצת על עצמך (למשל: "תמיד קר לי", "אני שומרת כשרות") וה-AI יכין לך רשימה.',
      ai_placeholder: 'דוגמה: אני רגיש ליתושים ואוהב נשנושים מהארץ...',
      ai_btn: 'צור רשימה אישית',
      categories: [
        { title: "ויזה (ETA)", items: ["ישראלים חייבים ויזה אלקטרונית (כ-50$ באתר eta.gov.lk)", "דרכון בתוקף ל-6 חודשים לפחות"] },
        { title: "כסף ומטבע", items: ["מטבע: רופי סרי-לנקי (LKR)", "להביא דולרים חדשים ונקיים להמרה", "אשראי עובד במלונות, מזומן לטוקטוקים"] },
        { title: "חשמל", items: ["מתח 230V, שקעים מסוג D (עגולים) או G (בריטי)", "מומלץ להביא מתאם אוניברסלי", "שיטת ה'עט' עובדת בזהירות"] },
        { title: "ביגוד", items: ["מכנסי טיולים משוחררים, טייצים, חצאיות", "בגדי ים", "סנדלי טיולים"] },
        { title: "אוכל וכשרות", items: ["אנו מספקים ארוחות כשר-סטייל", "בתי חב\"ד: קולומבו, אלה, ארוגם ביי", "פירות טרופיים בשפע"] }
      ]
    },
    discovery: {
      title: 'מגלים את סרי לנקה',
      subtitle: 'קצת רקע והיסטוריה שיעשו לכם חשק לארוז.',
    },
    about: {
      title: 'הסיפור שלנו',
      p1: 'אז הנה אנחנו, אייל, עליזה ונעמי 🙂.',
      p2: 'בקיץ 2025, שלושתנו נפגשנו בסרי לנקה אחרי שאייל ועליזה סיימו ירח דבש ארוך במזרח. אלו היו 10 ימים מופלאים של מפלים, גלישה, חופים, נופים ומלונות פשוט מצוינים (ואחד גרוע, רק כדי שיהיה על מה להתלונן).',
      p3: 'חזרנו הביתה, ולנעמי היה רעיון. למה לא להנגיש את החוויה משנת החיים הזו של טיול במזרח גם לסבתות ואימהות? כל כך הרבה צעירים ישראלים מטיילים אחרי הצבא באזור הזה של העולם ונהנים מהתקופה הטובה בחייהם. הם חיים את התרבות, לוקחים על עצמם אתגרים שמעולם לא היו עושים בבית ורואים את החיים מנקודת מבט חדשה לגמרי. אנחנו מאמינים שלכולם מגיע לקבל את ההזדמנות הזו. (אנחנו בעצם מאמינים שכולם חייבים לעשות את זה, אבל נדבר על זה כשניפגש :)',
      p4: 'הבנו שמי יכול להדריך סבתות ואימהות במסע הזה טוב יותר מאיתנו? אנחנו לא אנשי מכירות, אנחנו לא סוכנות נסיעות, אנחנו לא עובדים עם חברות גדולות. אנחנו 3 אנשים שחיים ונושמים את כל מה שיש לסרי לנקה להציע ואנחנו רוצים לתת לכן את ההזדמנות לחלוק את התשוקה הזו.',
      p5: 'כל אחד מאיתנו מביא משהו אחר להרפתקה שלכן. אני, נעמי, אהיה איתכן בכל חוויה, אדאג שכולן נהנות ואהיה זמינה תמיד לענות על כל שאלה. אייל ועליזה הם מדריכי יוגה מוסמכים ושפים מדהימים, והם ידאגו שכולן יאכלו טוב וירגישו במיטבן. (הם גם מנגנים בגיטרה ויוקולילי, מה שיהיה שימושי בהופעות החוף הליליות שלנו). יהיה איתנו גם מדריך ונהג מקומי כדי לוודא שנוכל להתנייד בקלות ולהבין ולהעריך את התרבות המקומית.',
      team: { eyal: 'אייל & עליזה - שפים ויוגה', naomi: 'נעמי - לוגיסטיקה', guide: 'מדריך מקומי צמוד' }
    },
    register: {
      title: 'שריינו את המקום שלכן',
      subtitle: 'מלאו פרטים ונחזור אליכם תוך 24 שעות.',
      contact_wa: 'שאלות? דברו עם אייל',
      contact_email: 'או שלחו מייל',
      details: ["מוגבל ל-15 משתתפות", "אין צורך בתשלום מיידי", "מדיניות ביטולים הוגנת"],
      form: { name: 'שם מלא', phone: 'טלפון', email: 'אימייל', guests: 'מספר משתתפים', notes: 'הערות', submit: 'שליחת בקשת הרשמה' }
    }
  },
  en: {
    nav: {
      home: 'Home',
      itinerary: 'Itinerary',
      essentials: 'Good to Know',
      discovery: 'Discovery',
      about: 'Our Story',
      register: 'Join Us',
      toggle: 'עבור לעברית'
    },
    hero: {
      title: 'Savtot in Sri Lanka\nSummer 2026',
      subtitle: 'A unique and unforgettable experience designed exclusively for mothers and grandmothers. The journey will feature an easy pace, exciting moments and local charm with a focus on nature, adventure, friendship and the beach.',
      tagline: '10 incredible days | Your post-kids/grandkids camp, end-of-summer once-in-a-lifetime trip',
      cta_plan: 'See the Plan',
      cta_discover: 'Explore'
    },
    features: {
      title: 'The trip of a lifetime',
      f1_title: 'Fully kosher',
      f1_desc: 'Fresh local ingredients prepared to kosher standards. A unique opportunity to experience the incredible local cuisine.',
      f2_title: 'Authentic culture',
      f2_desc: 'From safaris to tea plantations to sunrise hikes, you will get the chance to see the real Sri Lanka.',
      f3_title: 'Wellness & Yoga',
      f3_desc: 'Gentle yoga sessions at sunrise or sunset, for all levels to stretch and calm the body and mind.'
    },
    gallery: {
      title: 'Experience the magic',
      desc: 'From majestic waterfalls to glorious tea plantations to the golden shores of Arugam Bay, you’ll get the chance to see all the wonders of Sri Lanka.',
      cta: 'More info / Save your spot'
    },
    itinerary: {
      title: 'Your fully planned adventure',
      subtitle: 'Itinerary',
      days: [
        { day: 'Day 1 - 3', title: "Arrival & Sigiriya", desc: "Land in Colombo and head straight to the fresh, cool air of Sigiriya. Settle in, climb the famous Lion’s Rock, and experience the local village. See an elephant safari, go canyoning, rafting or take a rainforest walk." },
        { day: 'Day 4 - 5', title: "Ella & The Tea Country", desc: "Hike Little Adam’s Peak at sunrise, and get ready for the famous train ride. Explore the Nine Arches Bridge and sip the world-famous Ceylon in the rolling green plantations. See breathtaking waterfalls and heartstopping views when you are ziplining." },
        { day: 'Day 6 - 8', title: "Arugam Bay", desc: "Travel to Arugam Bay and settle into your boutique, beachfront apartment. Surf or take a surf lesson, explore the lagoons, hike up Elephant Rock at sunrise, go on a safari, sit at the beach, enjoy the spas and do some shopping. Enjoy some authentic local cuisine.\n\nExperience shabbat on the beach." },
        { day: 'Day 9', title: "Ocean Magic", desc: "Go snorkeling in the clear waters and see the corals and marine life. Get a massage, go souvenir shopping and spend time in the local town." },
        { day: 'Day 10', title: "Departure", desc: "Sunrise hike at the famous Elephant Rock and then pack up and drive to the airport. See your family and share your life-changing experiences with them." },
      ]
    },
    essentials: {
      title: 'Good to know',
      subtitle: 'Everything you need to know before packing your bags.',
      ai_title: 'What to Pack? Ask AI',
      ai_desc: 'Tell us about yourself (e.g., "Always cold", "Love spicy food") and AI will generate a list.',
      ai_placeholder: 'Example: I am traveling with my grandmother...',
      ai_btn: 'Generate List',
      categories: [
        { title: "Visa (ETA)", items: ["Israelis need an ETA (~$50 USD)", "Apply at eta.gov.lk", "Passport valid for 6 months"] },
        { title: "Money & Currency", items: ["Currency: Sri Lankan Rupee (LKR)", "Bring clean USD notes", "Cash is needed for Tuk-Tuks"] },
        { title: "Electricity", items: ["Voltage: 230V, Type D or G plugs", "Bring a universal adapter", "Pen trick works for Type G"] },
        { title: "Clothing", items: ["Loose hiking pants, leggings, skirts", "Bathing suits", "Hiking sandals"] },
        { title: "Kosher Food", items: ["We provide kosher-style meals", "Chabad Houses: Colombo, Ella, Arugam Bay", "Fresh tropical fruit"] }
      ]
    },
    discovery: {
      title: 'Discovery',
      subtitle: 'Get excited about the destination.',
    },
    about: {
      title: 'Our Story',
      p1: 'So here we are, Eyal, Aliza, and Naomi 🙂.',
      p2: 'In the summer of 2025, the three of us met in Sri Lanka after Eyal and Aliza completed a long honeymoon in the East. It was 10 miraculous days of waterfalls, surfing, beaches, landscapes, and simply excellent hotels (and one bad one, just so we’d have something to complain about).',
      p3: 'We returned home, and Naomi had an idea. Why not make this incredible, life-changing experience of travelling to the East accessible to savtas and mothers? So many young Israelis travel after the army to this part of the world and they have the time of their lives. They live the culture, they take on challenges they never would at home and they see life from a completely new perspective. We believe everyone should get the chance to do this. (We actually believe everyone needs to do this but we’ll discuss that when we meet:)',
      p4: 'We realized that who better to guide savtas and mothers on this life-changing journey than us? We are not salespeople, we are not a travel agency, we are not working with any big companies. We are 3 people who are passionate about all that Sri Lanka has to offer and we want to give you the opportunity to share that passion.',
      p5: 'We each bring something else to your Sri Lankan adventure. I, Naomi, will be with you through every experience, making sure everyone is thoroughly enjoying themselves and always available to answer any and all questions. Eyal and Aliza, are trained yoga instructors and incredible chefs and they will make sure everyone is well fed and feeling their best. (They also play guitar and ukulele, respectively, which will come in handy at our nighttime beach concerts.) We will also have a local guide and driver with us to make sure we can easily get around and to give us an understanding and appreciation for the local culture.',
      team: { eyal: 'Eyal & Aliza (Chefs/Yoga)', naomi: 'Naomi (Logistics)', guide: 'Local Guide' }
    },
    register: {
      title: 'Secure Your Spot',
      subtitle: 'Fill out the details below, and we will contact you within 24 hours.',
      contact_wa: 'Contact Eyal',
      contact_email: 'Or Email Us',
      details: ["Limited to 15 participants", "No immediate payment", "Full refund policy"],
      form: { name: 'Full Name', phone: 'Phone', email: 'Email', guests: 'Number of Travelers', notes: 'Special Requests', submit: 'Send Request' }
    }
  }
};

// --- רכיב תמונה הניתנת לעריכה (עם הגנת מנהל) ---
const EditableImage = ({ id, src, alt, className }: { id: string, src: string, alt: string, className: string }) => {
  const [imgSrc, setImgSrc] = useState(() => {
    const saved = localStorage.getItem(`savtot_img_${id}`);
    return saved || src;
  });
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgSrc(reader.result as string);
        localStorage.setItem(`savtot_img_${id}`, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`relative group overflow-hidden rounded-2xl h-full ${isAdmin ? 'cursor-pointer' : ''}`}>
      <img src={imgSrc} alt={alt} className={className} />
      
      {/* שכבת העריכה מוצגת רק אם אתה מנהל */}
      {isAdmin && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300 z-10">
          <Upload className="text-white w-8 h-8 mb-2" />
          <span className="text-white text-sm font-bold bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">החלף תמונה</span>
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
            onChange={handleFileChange} 
            accept="image/*" 
            title="לחץ להחלפת תמונה"
          />
        </div>
      )}
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Layout = ({ children, lang, setLang, t }: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLang((prev: string) => prev === 'he' ? 'en' : 'he');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className={`min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-teal-200 ${lang === 'he' ? 'font-hebrew' : 'font-english'}`}>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-lg backdrop-blur-sm py-2' : 'bg-transparent py-4 text-white'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          
          <Link 
            to="/" 
            onClick={closeMenu}
            className={`text-2xl font-serif font-bold cursor-pointer flex items-center gap-2 ${scrolled ? 'text-teal-900' : 'text-white'}`}
          >
            <Leaf className="w-6 h-6 text-orange-500" />
            <span>Savtot <span className="font-light italic">in Sri Lanka</span></span>
          </Link>

          <div className="hidden md:flex gap-6 items-center font-medium">
            <button 
              onClick={toggleLanguage}
              className={`flex items-center gap-2 px-3 py-1 rounded-full border ${scrolled ? 'border-teal-900 text-teal-900' : 'border-white text-white'} hover:bg-white/10 transition`}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs uppercase font-bold">{lang === 'he' ? 'EN' : 'HE'}</span>
            </button>

            {[
              { path: '/', label: t.nav.home },
              { path: '/itinerary', label: t.nav.itinerary },
              { path: '/essentials', label: t.nav.essentials },
              { path: '/discovery', label: t.nav.discovery },
              { path: '/about', label: t.nav.about },
            ].map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`hover:text-orange-500 transition-colors ${location.pathname === item.path ? 'text-orange-500 font-bold' : (scrolled ? 'text-stone-600' : 'text-white/90')}`}
              >
                {item.label}
              </Link>
            ))}
            <Link 
              to="/register"
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-bold transition-transform hover:scale-105 shadow-md"
            >
              {t.nav.register}
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className={scrolled ? 'text-teal-900' : 'text-white'} /> : <Menu className={scrolled ? 'text-teal-900' : 'text-white'} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t text-stone-800">
             <div className="p-4 border-b flex justify-between items-center bg-stone-50">
               <span className="text-sm font-bold text-stone-500">{t.nav.toggle}</span>
               <button onClick={() => { toggleLanguage(); closeMenu(); }} className="flex items-center gap-2 text-teal-700 font-bold">
                 <Globe className="w-5 h-5" /> {lang === 'he' ? 'English' : 'עברית'}
               </button>
             </div>
            <div className="flex flex-col p-4 gap-4">
               {[
              { path: '/', label: t.nav.home },
              { path: '/itinerary', label: t.nav.itinerary },
              { path: '/essentials', label: t.nav.essentials },
              { path: '/discovery', label: t.nav.discovery },
              { path: '/about', label: t.nav.about },
              { path: '/register', label: t.nav.register },
            ].map((item) => (
                <Link 
                  key={item.path}
                  to={item.path}
                  onClick={closeMenu}
                  className={`text-${lang === 'he' ? 'right' : 'left'} font-medium py-2 border-b border-stone-100 last:border-0 ${location.pathname === item.path ? 'text-orange-500 font-bold' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main>
        {children}
      </main>

      <footer className="bg-teal-900 text-teal-100 py-12 mt-12 relative">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8 text-center md:text-start">
          <div>
            <h3 className="text-2xl font-serif font-bold text-white mb-4">Savtot in Sri Lanka</h3>
            <p className="opacity-80 leading-relaxed">
              A unique, unforgettable experience designed exclusively for mothers and grandmothers.
            </p>
            <p className="opacity-80 mt-2 font-bold">Your hosts: Aliza, Eyal & Naomi | Summer 2026</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-lg">{lang === 'he' ? 'קישורים' : 'Links'}</h4>
            <ul className="space-y-2">
              <li><Link to="/itinerary" className="hover:text-orange-400">{t.nav.itinerary}</Link></li>
              <li><Link to="/essentials" className="hover:text-orange-400">{t.nav.essentials}</Link></li>
              <li><Link to="/register" className="hover:text-orange-400">{t.nav.register}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-lg">{lang === 'he' ? 'צרו קשר' : 'Contact Us'}</h4>
            <p className="opacity-80">Eyal: 054-351-0664</p>
            <p className="opacity-80">Naomi: +972 54-663-9597</p>
            <div className="mt-4 flex justify-center md:justify-start gap-4">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-orange-500 cursor-pointer transition-colors">📷</div>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-orange-500 cursor-pointer transition-colors">📘</div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12 pt-8 border-t border-teal-800 text-sm opacity-60 flex flex-col items-center gap-2">
          <span>© 2026 Savtot in Sri Lanka. Planning & Love: Aliza, Eyal, Naomi.</span>
          
          {/* כפתור כניסה למנהל - מנעול קטן */}
          <button 
            onClick={() => {
              const isAdmin = localStorage.getItem('isAdmin') === 'true';
              if (isAdmin) {
                if (confirm('האם לצאת ממצב עריכה?')) {
                  localStorage.setItem('isAdmin', 'false');
                  window.location.reload();
                }
              } else {
                const pass = prompt('סיסמת מנהל:');
                if (pass === '1086E') { 
                  localStorage.setItem('isAdmin', 'true');
                  alert('מצב עריכה הופעל! כעת ניתן לשנות תמונות.');
                  window.location.reload();
                } else if (pass !== null) {
                  alert('סיסמה שגויה');
                }
              }
            }}
            className="opacity-30 hover:opacity-100 transition-opacity p-2"
            title="Admin Login"
          >
            🔒
          </button>
        </div>
      </footer>
    </div>
  );
};

const HomePage = ({ t }: any) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <EditableImage 
            id="hero_bg" 
            src="/rock.jpg" 
            alt="Hero Background" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-teal-900/40 mix-blend-multiply pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 via-transparent to-transparent pointer-events-none" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto mt-16 pointer-events-none">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 drop-shadow-lg leading-tight whitespace-pre-line">
            {t.hero.title}
          </h1>
          <p className="text-xl md:text-2xl font-light mb-4 opacity-90 max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>
          <p className="text-lg md:text-xl font-bold mb-10 text-orange-300 drop-shadow-md">
            {t.hero.tagline}
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center pointer-events-auto">
            <button onClick={() => navigate('/itinerary')} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-orange-500/30">
              {t.hero.cta_plan}
            </button>
            <button onClick={() => navigate('/discovery')} className="bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-all">
              {t.hero.cta_discover}
            </button>
          </div>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-teal-900 mb-4">{t.features.title}</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: <Utensils className="w-10 h-10 text-orange-500" />, title: t.features.f1_title, desc: t.features.f1_desc },
              { icon: <MapPin className="w-10 h-10 text-orange-500" />, title: t.features.f2_title, desc: t.features.f2_desc },
              { icon: <Users className="w-10 h-10 text-orange-500" />, title: t.features.f3_title, desc: t.features.f3_desc },
            ].map((feature, idx) => (
              <div key={idx} className="bg-stone-50 p-8 rounded-2xl text-center hover:shadow-xl transition-shadow border border-stone-100 group">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-teal-800">{feature.title}</h3>
                <p className="text-stone-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-teal-900 text-white overflow-hidden relative">
        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 text-start">
            <h2 className="text-4xl font-serif font-bold mb-6">{t.gallery.title}</h2>
            <p className="text-teal-100 text-lg mb-8 leading-relaxed">
              {t.gallery.desc}
            </p>
            <button onClick={() => navigate('/register')} className="flex items-center gap-2 text-orange-400 font-bold hover:gap-4 transition-all">
              {t.gallery.cta} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </button>
          </div>
          <div className="md:w-1/2 grid grid-cols-2 gap-4">
             <EditableImage id="gal_1" src="/home2.jpg" alt="Gallery 1" className="rounded-2xl shadow-lg transform translate-y-8 w-full h-auto" />
             <EditableImage id="gal_2" src="/home3.jpg" alt="Gallery 2" className="rounded-2xl shadow-lg w-full h-auto" />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
      </section>
    </>
  );
};

const ItineraryPage = ({ t }: any) => {
  const dayImages = [
    '/1.jpg',   // Day 1-3
    '/3.jpg',   // Day 4-5
    '/arugam.jpg', // Day 6-8
    '/9.jpg',   // Day 9
    '/10.jpg',  // Day 10
  ];

  return (
    <div className="pt-32 pb-20 bg-stone-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-teal-900 mb-4">{t.itinerary.title}</h1>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">{t.itinerary.subtitle}</p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute start-1/2 transform -translate-x-1/2 h-full w-1 bg-teal-100 rounded-full"></div>

          <div className="space-y-12">
            {t.itinerary.days.map((item: any, index: number) => (
              <div key={index} className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                
                <div className="w-full md:w-1/2 p-4">
                  <div className="bg-white p-2 rounded-2xl shadow-lg rotate-1 hover:rotate-0 transition-transform duration-300">
                    <div className="h-64 bg-stone-200 rounded-xl overflow-hidden relative">
                       <EditableImage 
                        id={`itinerary_day_${index}`} 
                        src={dayImages[index] || '/home1.jpg'} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                       />
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/2 text-center md:text-start p-6 bg-white rounded-2xl shadow-md border-r-4 border-l-0 rtl:border-r-4 rtl:border-l-0 ltr:border-l-4 ltr:border-r-0 border-orange-400 relative">
                  <div className="absolute top-4 start-4 bg-teal-100 text-teal-800 font-bold px-3 py-1 rounded-full text-sm">
                    {item.day}
                  </div>
                  <h3 className="text-2xl font-bold text-teal-900 mb-3 pt-8">{item.title}</h3>
                  <p className="text-stone-600 mb-4 leading-relaxed whitespace-pre-line">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SmartPackingList = ({ t, lang }: any) => {
  const [userInput, setUserInput] = useState('');
  const [generatedList, setGeneratedList] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    setGeneratedList('');

    const systemPrompt = `
      You are a travel expert for 'Savtot in Sri Lanka'. 
      User Language: ${lang === 'he' ? 'Hebrew' : 'English'}.
      Create a short, bulleted packing list based on the user's description for a 10-day trip to Sri Lanka.
      Keep it creative and helpful. Output in ${lang === 'he' ? 'Hebrew' : 'English'}.
    `;
    
    const result = await callGemini(userInput, systemPrompt);
    setGeneratedList(result);
    setIsLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl shadow-lg p-8 border border-teal-100 my-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-teal-500"></div>
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-1 rounded-full shadow-sm mb-4 border border-teal-100">
           <Sparkles className="w-4 h-4 text-orange-500" />
           <span className="text-sm font-bold text-teal-800">AI Powered</span>
        </div>
        <h3 className="text-3xl font-serif font-bold text-teal-900 mb-3">{t.essentials.ai_title}</h3>
        <p className="text-stone-600 mb-6">{t.essentials.ai_desc}</p>

        <div className="flex flex-col gap-4">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={t.essentials.ai_placeholder}
            className="w-full p-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-teal-500 focus:outline-none min-h-[100px] text-start"
          />
          <button 
            onClick={handleGenerate}
            disabled={isLoading || !userInput}
            className="bg-teal-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-teal-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isLoading ? '...' : t.essentials.ai_btn}
          </button>
        </div>

        {generatedList && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-inner text-start border-r-4 border-orange-400 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="font-bold text-lg text-teal-900 mb-3 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-teal-600" />
              Recommendation:
            </h4>
            <div className="prose prose-stone text-stone-700 whitespace-pre-line">
              {generatedList}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EssentialsPage = ({ t, lang }: any) => {
  const icons: any = {
    0: <BookOpen className="w-8 h-8" />,
    1: <CreditCard className="w-8 h-8" />,
    2: <Wifi className="w-8 h-8" />,
    3: <Camera className="w-8 h-8" />,
    4: <Utensils className="w-8 h-8" />
  };

  return (
    <div className="pt-32 pb-20 bg-stone-50 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-bold text-teal-900 mb-4">{t.essentials.title}</h1>
          <p className="text-lg text-stone-600">{t.essentials.subtitle}</p>
        </div>

        <SmartPackingList t={t} lang={lang} />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.essentials.categories.map((cat: any, idx: number) => (
            <div key={idx} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border-t-4 border-orange-400">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-teal-50 p-3 rounded-full text-teal-700">
                    {icons[idx] || <Leaf className="w-8 h-8" />}
                  </div>
                  <h3 className="text-xl font-bold text-teal-900">{cat.title}</h3>
                </div>
                <ul className="space-y-3">
                  {cat.items.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-stone-600 text-sm leading-relaxed text-start">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DiscoveryPage = ({ t }: any) => {
  const galleryImages = [
    "/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", 
    "/5.jpg", "/6.jpg", "/8.jpg", "/9.jpg", 
    "/10.jpg", "/arugam.jpg", "/rock.jpg", "/tea.jpg",
    "/home2.jpg", "/home3.jpg"
  ];

  return (
    <div className="pt-32 pb-20 bg-stone-50 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-bold text-teal-900 mb-4">{t.discovery.title}</h1>
          <p className="text-lg text-stone-600">{t.discovery.subtitle}</p>
        </div>

        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {galleryImages.map((src, idx) => (
            <div key={idx} className="break-inside-avoid">
              <EditableImage 
                id={`discovery_gallery_${idx}`} 
                src={src} 
                alt={`Sri Lanka Discovery ${idx + 1}`} 
                className="w-full rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 object-cover" 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AboutPage = ({ t }: any) => (
  <div className="pt-32 pb-20 bg-stone-50 min-h-screen">
    <div className="container mx-auto px-6 max-w-4xl text-center">
      <h1 className="text-5xl font-serif font-bold text-teal-900 mb-8">{t.about.title}</h1>
      
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl mb-12">
        <EditableImage 
          id="about_family" 
          src="/family.jpg" 
          alt="Family" 
          className="w-full md:w-2/3 h-80 object-cover rounded-2xl mx-auto mb-8 shadow-sm"
        />
        
        <div className="space-y-6 text-lg text-stone-700 leading-relaxed text-start">
          <p>{t.about.p1}</p>
          <p>{t.about.p2}</p>
          <p>{t.about.p3}</p>
          <p>{t.about.p4}</p>
          <p>{t.about.p5}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 text-center">
        <div className="p-4">
          <div className="text-4xl mb-2">🧘‍♀️</div>
          <h3 className="font-bold text-teal-900">{t.about.team.eyal}</h3>
        </div>
        <div className="p-4">
          <div className="text-4xl mb-2">🗺️</div>
          <h3 className="font-bold text-teal-900">{t.about.team.naomi}</h3>
        </div>
        <div className="p-4">
          <div className="text-4xl mb-2">🇱🇰</div>
          <h3 className="font-bold text-teal-900">{t.about.team.guide}</h3>
        </div>
      </div>
    </div>
  </div>
);

const RegisterPage = ({ t }: any) => {
  return (
    <div className="pt-32 pb-20 bg-stone-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12">
          
          <div className="md:w-1/2 text-start">
            <h1 className="text-4xl font-serif font-bold text-teal-900 mb-6">{t.register.title}</h1>
            <p className="text-lg text-stone-600 mb-8">{t.register.subtitle}</p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-teal-800 bg-white p-4 rounded-xl shadow-sm">
                <Phone className="w-6 h-6" />
                <div>
                  <p className="font-bold">{t.register.contact_wa}</p>
                  <p dir="ltr" className="text-lg">054-351-0664 (Eyal)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-teal-800 bg-white p-4 rounded-xl shadow-sm">
                <Mail className="w-6 h-6" />
                <div>
                  <p className="font-bold">{t.register.contact_email}</p>
                  <p dir="ltr" className="text-lg">eyalbgr@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-teal-800 bg-white p-4 rounded-xl shadow-sm">
                <Users className="w-6 h-6" />
                <div>
                  <p className="font-bold">Naomi</p>
                  <p dir="ltr" className="text-lg">+972 54-663-9597</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-orange-50 p-6 rounded-xl border border-orange-100">
              <h4 className="font-bold text-orange-800 mb-3">פרטים נוספים</h4>
              <ul className="space-y-2 text-stone-700">
                {t.register.details.map((detail: string, idx: number) => (
                  <li key={idx}>✅ {detail}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:w-1/2">
            <form action="https://formspree.io/f/xreqgpza" method="POST" className="bg-white p-8 rounded-3xl shadow-xl border-t-8 border-teal-600">
              <div className="space-y-6 text-start">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">{t.register.form.name}</label>
                  <input type="text" name="name" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">{t.register.form.phone}</label>
                    <input type="tel" name="phone" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">{t.register.form.email}</label>
                    <input type="email" name="email" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">{t.register.form.guests}</label>
                  <select name="guests" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">{t.register.form.notes}</label>
                  <textarea name="message" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-32"></textarea>
                </div>

                <button type="submit" className="w-full bg-teal-900 hover:bg-teal-800 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-md">
                  {t.register.form.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState('en');
  const t = contentData[lang as keyof typeof contentData]; 

  useEffect(() => {
    document.dir = lang === 'he' ? 'rtl' : 'ltr';
  }, [lang]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout lang={lang} setLang={setLang} t={t}>
        <Routes>
          <Route path="/" element={<HomePage t={t} />} />
          <Route path="/itinerary" element={<ItineraryPage t={t} />} />
          <Route path="/essentials" element={<EssentialsPage t={t} lang={lang} />} />
          <Route path="/discovery" element={<DiscoveryPage t={t} />} />
          <Route path="/about" element={<AboutPage t={t} />} />
          <Route path="/register" element={<RegisterPage t={t} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
