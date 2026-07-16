import Link from 'next/link'
import React from 'react'
import type { Metadata } from 'next'
import FinePrintTracker from '../../shared/badges/FinePrintTracker'

/* =========================================================================
   ⚠️  PLACEHOLDER-E DE COMPLETAT DUPĂ ÎNREGISTRAREA FIRMEI
   Modifică valorile de mai jos într-un singur loc; se reflectă în toată pagina.
   ========================================================================= */
const OPERATOR_NAME = 'dexurban.md SRL'                                   // ⚠️ denumirea juridică exactă a firmei
const OPERATOR_IDNO = '0000000000000'                                    // ⚠️ IDNO (13 cifre)
const OPERATOR_ADDRESS = 'str. Ștefan cel Mare 1, Chișinău, Republica Moldova' // ⚠️ adresa sediului
const CONTACT_EMAIL = 'contact@dexurban.md'                              // ⚠️ email oficial de contact / sesizări
const LAST_UPDATED = '3 iulie 2026'                                       // ⚠️ data ultimei actualizări
/* ========================================================================= */

export const metadata: Metadata = {
  title: 'Termeni și condiții | DexUrban.md',
  description:
    'Termenii și condițiile de utilizare a dexurban.md - dicționar satiric de argou. Caracter umoristic, responsabilitatea utilizatorului, mecanism de sesizare și legea aplicabilă (Republica Moldova).',
  alternates: {
    canonical: 'https://www.dexurban.md/termeni-si-conditii',
  },
}

const Tos = () => {
  return (
    <article className='mx-auto px-3 md:px-8'>
      <FinePrintTracker type='terms' />
      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Termeni și condiții</h1>
        <p className='font-Spacegrotesc'><b>{OPERATOR_NAME}</b> oferă site-ul <b>dexurban.md</b> („Platforma”) conform Termenilor și condițiilor de mai jos. Prin accesarea, navigarea sau utilizarea Platformei, prin crearea unui cont ori prin publicarea de conținut, declarați că ați citit, ați înțeles și sunteți de acord cu acești termeni. Dacă nu sunteți de acord, vă rugăm să nu utilizați Platforma. Ne rezervăm dreptul de a revizui acești termeni periodic; utilizarea în continuare a Platformei după publicarea modificărilor reprezintă acceptarea lor. Versiunea în vigoare este disponibilă permanent la <Link className='underline text-myorange' href='/termeni-si-conditii'>dexurban.md/termeni-si-conditii</Link>.</p>
        <p className='font-Spacegrotesc mt-3'><b>Data ultimei actualizări:</b> {LAST_UPDATED}.</p>
      </section>

      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Caracterul satiric al Platformei</h1>
        <p className='font-Spacegrotesc'>DexUrban.md este un <b>proiect de umor și satiră lingvistică</b>, dedicat colectării argoului, jargonului și expresiilor populare din limba română. Definițiile, exemplele și celelalte texte publicate pe Platformă sunt <b>contribuții ale utilizatorilor</b> și au caracter umoristic, ironic, exagerat sau parodic.</p>
        <p className='font-Spacegrotesc mt-3'>Prin natura sa, conținutul Platformei <b>NU reprezintă afirmații de fapt</b>, opinii ale operatorului, informații enciclopedice verificate sau descrieri reale ale unor persoane, instituții ori evenimente. Definițiile nu trebuie interpretate literal și nu constituie sfaturi juridice, medicale, financiare sau de altă natură. Orice asemănare cu persoane, denumiri sau situații reale este, de regulă, intenționat comică și nu trebuie înțeleasă ca o relatare a unor fapte adevărate.</p>
        <p className='font-Spacegrotesc mt-3'>Conținutul poate fi prezentat într-o manieră grosieră, vulgară sau ofensatoare pentru unii cititori. Platforma nu este destinată persoanelor sub 16 ani. Prin utilizarea Platformei declarați că aveți cel puțin 16 ani. Dacă nu vă considerați un public potrivit sau vă simțiți ofensat, vă rugăm să nu utilizați Platforma.</p>
      </section>

      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Rolul operatorului (furnizor de servicii de găzduire)</h1>
        <p className='font-Spacegrotesc'>Platforma funcționează ca un serviciu care găzduiește și afișează conținut generat de utilizatori. În sensul Legii nr. 284/2004 privind comerțul electronic, operatorul acționează ca <b>furnizor intermediar de servicii de stocare-găzduire (hosting)</b> a informației furnizate de destinatarii serviciului.</p>
        <p className='font-Spacegrotesc mt-3'>Operatorul <b>nu inițiază</b> transmiterea conținutului, nu selectează destinatarul acestuia și <b>nu selectează ori modifică</b> definițiile publicate de utilizatori. Operatorul nu are obligația generală de a supraveghea informația pe care o stochează, nici de a căuta activ fapte care indică o activitate ilicită. Operatorul nu răspunde pentru conținutul stocat la cererea unui utilizator cu condiția să nu aibă cunoștință efectivă despre caracterul ilicit al acestuia, iar din momentul în care ia cunoștință să acționeze prompt pentru eliminarea lui sau blocarea accesului la el (a se vedea secțiunea „Sesizări și eliminarea conținutului”).</p>
      </section>

      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Responsabilitatea utilizatorului</h1>
        <p className='font-Spacegrotesc'>Sunteți <b>singurul responsabil</b> pentru orice conținut (cuvinte, definiții, exemple, comentarii, denumit colectiv „Conținut”) pe care îl publicați pe Platformă și pentru consecințele publicării lui. Prin publicare, declarați și garantați că:</p>
        <ul className='list-disc font-Spacegrotesc ml-5 mb-5 mt-3'>
          <li>dețineți toate drepturile necesare asupra Conținutului sau aveți autorizarea de a-l publica;</li>
          <li>Conținutul nu încalcă drepturile niciunei terțe părți, inclusiv drepturile de proprietate intelectuală, dreptul la viață privată, la imagine, la onoare și demnitate;</li>
          <li>Conținutul nu încalcă nicio lege, ordonanță sau reglementare aplicabilă;</li>
          <li>Conținutul nu este fraudulos, defăimător sau menit să inducă în eroare;</li>
          <li>înțelegeți caracterul satiric al Platformei și nu prezentați drept fapte reale afirmații neadevărate despre persoane identificabile.</li>
        </ul>
      </section>

      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Conținut interzis</h1>
        <p className='font-Spacegrotesc'>Este strict interzisă publicarea de Conținut care:</p>
        <ul className='list-disc font-Spacegrotesc ml-5 mb-5 mt-3'>
          <li>atacă, defăimează, umilește sau vizează în mod ostil <b>persoane private reale identificabile</b> (prin nume, poreclă recognoscibilă, adresă, loc de muncă etc.);</li>
          <li>constituie hărțuire, amenințare, intimidare, incitare la ură, la violență sau la discriminare pe orice criteriu;</li>
          <li>divulgă date cu caracter personal ale altei persoane (adresă, telefon, date de identificare) fără consimțământ („doxxing”);</li>
          <li>are conținut ilegal, inclusiv conținut ce implică minori, promovarea terorismului, a traficului de ființe umane sau a substanțelor interzise;</li>
          <li>încalcă drepturi de autor, mărci comerciale sau alte drepturi de proprietate intelectuală;</li>
          <li>conține malware, spam ori este trimis prin mijloace automate neautorizate („boți”);</li>
          <li>uzurpă identitatea unei persoane ori sugerează fals o afiliere cu o organizație.</li>
        </ul>
        <p className='font-Spacegrotesc'>Satira vizează, de regulă, fenomene sociale, cuvinte și tipare de limbaj - nu persoane private concrete. Umorul nu justifică hărțuirea sau lezarea demnității unei persoane reale.</p>
      </section>

      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Licența acordată Platformei</h1>
        <p className='font-Spacegrotesc'>Păstrați drepturile pe care le dețineți asupra Conținutului dvs. Prin publicarea Conținutului pe Platformă, acordați operatorului o <b>licență neexclusivă, mondială, fără redevențe (gratuită), transferabilă și sublicențiabilă</b> de a stoca, reproduce, adapta, traduce, publica, afișa public și distribui Conținutul, în scopul:</p>
        <ul className='list-disc font-Spacegrotesc ml-5 mb-5 mt-3'>
          <li>operării, promovării și îmbunătățirii Platformei și a serviciilor asociate;</li>
          <li>afișării definițiilor pe site, în rețelele sociale ale proiectului și în materiale de promovare;</li>
          <li>utilizării definițiilor și expresiilor pe <b>produse din magazinul propriu (merch)</b> - de exemplu tricouri, căni, autocolante și alte produse.</li>
        </ul>
        <p className='font-Spacegrotesc'>Licența rămâne valabilă și după eliminarea Conținutului, în măsura necesară pentru copiile deja distribuite sau integrate în produse ori materiale realizate anterior. Nu sunteți îndreptățit la nicio compensație pentru utilizarea Conținutului în condițiile de mai sus.</p>
      </section>

      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Sesizări și eliminarea conținutului (notice &amp; takedown)</h1>
        <p className='font-Spacegrotesc'>Dacă o definiție vă vizează, vă lezează drepturile, încalcă legea sau prezentul document, o puteți raporta astfel:</p>
        <ul className='list-disc font-Spacegrotesc ml-5 mb-5 mt-3'>
          <li>folosind funcția <b>„Semnalează / Raportează”</b> disponibilă pe fiecare definiție de pe Platformă; sau</li>
          <li>trimițând o sesizare pe email la <a className='text-myorange underline' href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</li>
        </ul>
        <p className='font-Spacegrotesc'>Pentru a putea acționa rapid, sesizarea ar trebui să conțină: (a) linkul (URL-ul) definiției reclamate; (b) descrierea problemei și motivul (de ex. defăimare, date personale, drepturi de autor); (c) datele dvs. de contact; și (d) o declarație privind corectitudinea informațiilor furnizate.</p>
        <p className='font-Spacegrotesc mt-3'>După primirea unei sesizări întemeiate, operatorul va analiza conținutul și, dacă acesta este ilicit sau încalcă acești termeni, îl va <b>elimina sau va bloca prompt accesul</b> la el. Operatorul poate elimina orice Conținut, la libera sa apreciere, fără notificare prealabilă, dar nu își asumă o obligație generală de monitorizare a conținutului publicat de utilizatori.</p>
      </section>

      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Indemnizare (despăgubire)</h1>
        <p className='font-Spacegrotesc'>Sunteți de acord să <b>despăgubiți, să apărați și să exonerați de răspundere</b> operatorul {OPERATOR_NAME}, precum și administratorii, angajații, colaboratorii și reprezentanții săi, de orice pretenții, acțiuni, reclamații, pierderi, daune, costuri și cheltuieli (inclusiv onorarii rezonabile de avocat) care decurg din sau în legătură cu: (i) Conținutul pe care l-ați publicat; (ii) încălcarea de către dvs. a acestor Termeni și condiții sau a legii; ori (iii) încălcarea drepturilor unei terțe părți prin Conținutul dvs. Dacă operatorul este acționat în justiție ori sancționat din cauza unei postări a dvs., răspunderea și costurile aferente vă revin.</p>
      </section>

      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Limitarea răspunderii și garanții</h1>
        <p className='font-Spacegrotesc'>Platforma este oferită <b>„ca atare” („as is”) și „așa cum este disponibilă”</b>, fără nicio garanție de orice fel, expresă sau implicită. Operatorul <b>nu garantează</b> acuratețea, veridicitatea, exhaustivitatea ori calitatea definițiilor și nu garantează că Platforma va funcționa neîntrerupt, la timp, securizat sau fără erori.</p>
        <p className='font-Spacegrotesc mt-3'>Utilizând Platforma, puteți fi expus la conținut pe care îl puteți considera ofensator, indecent, incorect sau discutabil. În limitele permise de lege, operatorul nu răspunde pentru niciun Conținut și pentru niciun prejudiciu, direct sau indirect, rezultat din utilizarea Platformei sau din încrederea acordată vreunei definiții. Vă asumați integral riscul utilizării Platformei.</p>
      </section>

      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Conturi și suspendare</h1>
        <p className='font-Spacegrotesc'>Sunteți responsabil pentru păstrarea confidențialității datelor contului dvs. și pentru activitățile desfășurate prin contul dvs. Operatorul poate, la libera sa apreciere și fără notificare prealabilă, să <b>avertizeze, să limiteze, să suspende sau să închidă</b> conturile și să elimine conținutul utilizatorilor care încalcă acești termeni, legea ori spiritul Platformei, inclusiv în cazul încălcărilor repetate ale drepturilor terților.</p>
      </section>

      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Proprietate intelectuală asupra Platformei</h1>
        <p className='font-Spacegrotesc'>Operatorul deține drepturile asupra Platformei ca atare și asupra elementelor sale (design, logo, cod-sursă, structură, grafică și documentație). Nu aveți dreptul să copiați, modificați, decompilați sau să exploatați aceste elemente fără acordul scris al operatorului. Drepturile asupra Conținutului publicat de utilizatori rămân ale autorilor, sub rezerva licenței acordate mai sus.</p>
      </section>

      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Confidențialitate</h1>
        <p className='font-Spacegrotesc'>Prelucrarea datelor cu caracter personal este descrisă în <Link className='text-myorange underline' href='/politica-de-confidentialitate'>Politica de confidențialitate</Link>, care face parte integrantă din acești termeni.</p>
      </section>

      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Legea aplicabilă și instanțele competente</h1>
        <p className='font-Spacegrotesc'>Acești Termeni și condiții sunt guvernați de legislația <b>Republicii Moldova</b>. Orice litigiu în legătură cu Platforma sau cu acești termeni va fi soluționat, în măsura în care nu se ajunge la o rezolvare amiabilă, de <b>instanțele judecătorești competente din Republica Moldova</b>, potrivit regulilor de competență prevăzute de lege. Dacă vreo prevedere a acestor termeni este considerată nulă sau inaplicabilă, celelalte prevederi rămân în vigoare.</p>
      </section>

      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Modificarea termenilor</h1>
        <p className='font-Spacegrotesc'>Putem modifica acești Termeni și condiții oricând. Modificările intră în vigoare la data publicării pe această pagină, iar data ultimei actualizări este afișată la începutul documentului. Vă recomandăm să reveniți periodic. Utilizarea în continuare a Platformei după intrarea în vigoare a modificărilor reprezintă acceptarea acestora.</p>
      </section>

      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Contact</h1>
        <p className='font-Spacegrotesc'>Pentru întrebări sau sesizări legate de acești termeni, ne puteți contacta la <a className='text-myorange underline' href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
        <p className='font-Spacegrotesc mt-3 text-sm opacity-80'>Operator: {OPERATOR_NAME}, IDNO {OPERATOR_IDNO}, {OPERATOR_ADDRESS}.</p>
      </section>
    </article>
  )
}

export default Tos
