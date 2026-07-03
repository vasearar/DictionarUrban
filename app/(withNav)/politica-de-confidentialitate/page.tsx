import Link from 'next/link'
import React from 'react'
import type { Metadata } from 'next'
import CookiePreferencesButton from '../../shared/CookiePreferencesButton'

/* =========================================================================
   ⚠️  PLACEHOLDER-E DE COMPLETAT DUPĂ ÎNREGISTRAREA FIRMEI
   Modifică valorile de mai jos într-un singur loc; se reflectă în toată pagina.
   ========================================================================= */
const OPERATOR_NAME = 'dexurban.md SRL'                                   // ⚠️ denumirea juridică exactă a firmei
const OPERATOR_IDNO = '0000000000000'                                    // ⚠️ IDNO (13 cifre)
const OPERATOR_ADDRESS = 'str. Ștefan cel Mare 1, Chișinău, Republica Moldova' // ⚠️ adresa sediului
const CONTACT_EMAIL = 'contact@dexurban.md'                              // ⚠️ email oficial de contact / cereri privind datele
const LAST_UPDATED = '3 iulie 2026'                                       // ⚠️ data ultimei actualizări
/* ========================================================================= */

export const metadata: Metadata = {
  title: 'Politica de confidențialitate | DexUrban.md',
  description:
    'Cum colectează și prelucrează dexurban.md datele cu caracter personal, conform Legii nr. 133/2011 a Republicii Moldova și GDPR pentru vizitatorii din UE: date colectate, temeiuri legale, drepturi și cookie-uri.',
  alternates: {
    canonical: 'https://www.dexurban.md/politica-de-confidentialitate',
  },
}

const Privacy = () => {
  return (
    <article className='mx-auto px-3 md:px-8'>
      <section>
        <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Politica de confidențialitate</h1>
        <p className='font-Spacegrotesc'>Această politică explică ce date cu caracter personal colectăm despre dvs. atunci când utilizați dexurban.md („Platforma”), în ce scop și în ce temei le prelucrăm, cui le divulgăm, cât timp le păstrăm și ce drepturi aveți. Prelucrarea se face cu respectarea <b>Legii nr. 133/2011 privind protecția datelor cu caracter personal</b> din Republica Moldova și, pentru vizitatorii din Uniunea Europeană, a <b>Regulamentului (UE) 2016/679 (GDPR)</b>.</p>
        <p className='font-Spacegrotesc mt-3'>Utilizarea Platformei este supusă și <Link className='text-myorange underline' href='/termeni-si-conditii'>Termenilor și condițiilor</Link>.</p>
        <p className='font-Spacegrotesc mt-3'><b>Data ultimei actualizări:</b> {LAST_UPDATED}.</p>
      </section>

      <section>
        <h2 className='text-xl md:text-3xl leading-tight mb-4 mt-6 font-bold'>Cine este operatorul de date</h2>
        <p className='font-Spacegrotesc'>Operatorul care stabilește scopurile și mijloacele prelucrării datelor dvs. este:</p>
        <ul className='list-disc font-Spacegrotesc ml-5 mb-5 mt-3'>
          <li><b>Denumire:</b> {OPERATOR_NAME} {/* ⚠️ PLACEHOLDER: denumirea juridică */}</li>
          <li><b>IDNO:</b> {OPERATOR_IDNO} {/* ⚠️ PLACEHOLDER: cod IDNO, 13 cifre */}</li>
          <li><b>Sediu:</b> {OPERATOR_ADDRESS} {/* ⚠️ PLACEHOLDER: adresa sediului */}</li>
          <li><b>Email de contact:</b> <a className='text-myorange underline' href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> {/* ⚠️ PLACEHOLDER */}</li>
        </ul>
      </section>

      <section>
        <h2 className='text-xl md:text-3xl leading-tight mb-4 mt-6 font-bold'>Ce date colectăm</h2>
        <p className='font-Spacegrotesc'>În funcție de modul în care utilizați Platforma, putem colecta:</p>
        <ul className='list-disc font-Spacegrotesc ml-5 mb-5 mt-3'>
          <li><b>Date de cont:</b> adresa de email, porecla (username) și, în cazul înregistrării cu email și parolă, <b>parola stocată exclusiv sub formă de hash</b> (nu păstrăm parola în text clar). La autentificarea prin Google (OAuth) primim de la Google adresa de email și, după caz, numele afișat.</li>
          <li><b>Conținutul publicat:</b> definițiile, exemplele, aprecierile (like/dislike) și sesizările pe care le transmiteți.</li>
          <li><b>Date tehnice și de utilizare:</b> adresa IP, tipul de browser și dispozitiv, paginile accesate, data și ora solicitărilor, precum și localizarea geografică aproximativă derivată din IP.</li>
          <li><b>Cookie-uri și tehnologii similare:</b> a se vedea secțiunea „Cookie-uri” de mai jos.</li>
          <li><b>Corespondența:</b> mesajele pe care ni le trimiteți prin email sau prin formularele de contact/raportare.</li>
        </ul>
        <p className='font-Spacegrotesc'>Nu colectăm în mod intenționat categorii speciale de date (de ex. date privind sănătatea, opiniile politice, orientarea etc.). Vă rugăm să nu includeți astfel de date în conținutul publicat.</p>
      </section>

      <section>
        <h2 className='text-xl md:text-3xl leading-tight mb-4 mt-6 font-bold'>Scopurile și temeiurile legale ale prelucrării</h2>
        <p className='font-Spacegrotesc'>Prelucrăm datele dvs. în următoarele scopuri și temeiuri:</p>
        <ul className='list-disc font-Spacegrotesc ml-5 mb-5 mt-3'>
          <li><b>Crearea și administrarea contului, autentificarea și furnizarea Platformei</b> - temei: executarea contractului (acceptarea Termenilor și condițiilor).</li>
          <li><b>Publicarea și afișarea conținutului</b> pe care îl trimiteți - temei: executarea contractului.</li>
          <li><b>Securitatea Platformei, prevenirea abuzurilor, a fraudei și a spamului, moderarea conținutului</b> - temei: interesul legitim al operatorului de a menține un serviciu sigur și funcțional.</li>
          <li><b>Statistici de audiență și îmbunătățirea Platformei (analytics)</b> - temei: consimțământul dvs. pentru cookie-urile neesențiale, respectiv interesul legitim pentru statistici agregate.</li>
          <li><b>Comunicări legate de cont</b> (de ex. verificarea emailului, resetarea parolei) - temei: executarea contractului.</li>
          <li><b>Respectarea obligațiilor legale</b> și soluționarea sesizărilor sau litigiilor - temei: obligația legală, respectiv interesul legitim.</li>
        </ul>
        <p className='font-Spacegrotesc'>Atunci când temeiul este consimțământul, îl puteți retrage oricând, fără a afecta legalitatea prelucrării efectuate anterior retragerii.</p>
      </section>

      <section>
        <h2 className='text-xl md:text-3xl leading-tight mb-4 mt-6 font-bold'>Cui divulgăm datele (furnizori terți)</h2>
        <p className='font-Spacegrotesc'>Nu vindem datele dvs. personale. Le putem divulga unor furnizori terți („persoane împuternicite”) care ne ajută să operăm Platforma, exclusiv pe baza unor contracte care îi obligă să protejeze datele și să le prelucreze doar conform instrucțiunilor noastre. Categoriile de furnizori sunt:</p>
        <ul className='list-disc font-Spacegrotesc ml-5 mb-5 mt-3'>
          <li><b>Găzduire și infrastructură (hosting, baze de date):</b> furnizorii care rulează serverele și baza de date a Platformei.</li>
          <li><b>Servicii de email:</b> furnizorii prin care trimitem emailuri tranzacționale (verificare cont, resetare parolă).</li>
          <li><b>Analiză de audiență (analytics):</b> de exemplu Google Analytics, pentru statistici de utilizare.</li>
          <li><b>Autentificare:</b> Google (autentificare prin OAuth), atunci când alegeți conectarea cu contul Google.</li>
          <li><b>Procesatori de plăți:</b> în cazul achizițiilor din magazin (merch) sau al donațiilor, furnizorii de plăți relevanți prelucrează datele tranzacției.</li>
          <li><b>Autorități publice:</b> atunci când legea ne obligă sau pentru a proteja drepturile, siguranța și proprietatea.</li>
        </ul>
        <p className='font-Spacegrotesc'><b>Transferuri în afara Republicii Moldova.</b> O parte dintre acești furnizori (de ex. Google) sunt localizați sau stochează date în afara Republicii Moldova, inclusiv în Uniunea Europeană sau în Statele Unite. În aceste cazuri ne asigurăm că transferul beneficiază de garanții adecvate potrivit legii aplicabile (de ex. clauze contractuale standard sau alte mecanisme recunoscute).</p>
      </section>

      <section>
        <h2 className='text-xl md:text-3xl leading-tight mb-4 mt-6 font-bold'>Cât timp păstrăm datele</h2>
        <ul className='list-disc font-Spacegrotesc ml-5 mb-5 mt-3'>
          <li><b>Datele de cont</b> - pe durata existenței contului. După ștergerea contului le eliminăm sau anonimizăm într-un termen rezonabil, cu excepția situațiilor în care păstrarea este necesară pentru obligații legale sau pentru soluționarea unor litigii.</li>
          <li><b>Conținutul publicat</b> - poate rămâne pe Platformă și după ștergerea contului, însă îl putem disocia de datele dvs. de identificare la cerere.</li>
          <li><b>Datele tehnice și jurnalele de acces (loguri)</b> - de regulă o perioadă limitată (uzual până la 12 luni), în scopuri de securitate.</li>
          <li><b>Corespondența și sesizările</b> - atât cât este necesar pentru soluționarea lor și pentru evidența eventualelor reclamații.</li>
        </ul>
      </section>

      <section>
        <h2 className='text-xl md:text-3xl leading-tight mb-4 mt-6 font-bold'>Drepturile dvs.</h2>
        <p className='font-Spacegrotesc'>În calitate de persoană vizată, aveți următoarele drepturi cu privire la datele dvs.:</p>
        <ul className='list-disc font-Spacegrotesc ml-5 mb-5 mt-3'>
          <li><b>Dreptul de acces</b> - de a ști ce date deținem despre dvs. și de a obține o copie.</li>
          <li><b>Dreptul la rectificare</b> - de a corecta datele inexacte sau incomplete.</li>
          <li><b>Dreptul la ștergere</b> („dreptul de a fi uitat”) - de a solicita eliminarea datelor, în condițiile legii.</li>
          <li><b>Dreptul la restricționarea prelucrării</b> și <b>dreptul la opoziție</b> față de prelucrările întemeiate pe interesul legitim.</li>
          <li><b>Dreptul de a retrage consimțământul</b> oricând, acolo unde prelucrarea se bazează pe consimțământ (de ex. cookie-uri de analiză).</li>
          <li><b>Dreptul la portabilitatea datelor</b> - de a primi datele într-un format structurat, utilizat frecvent (aplicabil în special vizitatorilor din UE, conform GDPR).</li>
          <li><b>Dreptul de a depune o plângere</b> la autoritatea de supraveghere (în Republica Moldova - Centrul Național pentru Protecția Datelor cu Caracter Personal; în UE - autoritatea de protecție a datelor din statul dvs.).</li>
        </ul>
        <p className='font-Spacegrotesc'>Vă puteți exercita drepturile trimițând o cerere la <a className='text-myorange underline' href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Putem solicita informații suplimentare pentru a vă verifica identitatea înainte de a da curs cererii. Răspundem în termenele prevăzute de lege.</p>
      </section>

      <section>
        <h2 className='text-xl md:text-3xl leading-tight mb-4 mt-6 font-bold'>Cookie-uri</h2>
        <p className='font-Spacegrotesc'>Un cookie este un fișier mic stocat în browserul dvs. Folosim următoarele tipuri:</p>
        <ul className='list-disc font-Spacegrotesc ml-5 mb-5 mt-3'>
          <li><b>Cookie-uri strict necesare</b> - indispensabile funcționării Platformei, de exemplu pentru autentificare și menținerea sesiunii (NextAuth) și pentru securitate. Acestea nu necesită consimțământ.</li>
          <li><b>Cookie-uri de preferințe</b> - rețin opțiuni precum tema afișării. Îmbunătățesc experiența, dar nu sunt esențiale.</li>
          <li><b>Cookie-uri de analiză / statistică (analytics)</b> - de exemplu Google Analytics, pentru a înțelege cum este utilizată Platforma.</li>
        </ul>
        <p className='font-Spacegrotesc'>Cookie-urile <b>neesențiale</b> (de preferințe și de analiză) sunt utilizate <b>numai cu consimțământul dvs.</b>. Vă puteți retrage consimțământul sau puteți bloca ori șterge cookie-urile oricând din setările browserului; unele funcționalități pot fi afectate.</p>
        <p className='font-Spacegrotesc mt-4 mb-4'>Vă puteți răzgândi oricând — apăsați butonul de mai jos pentru a reafișa bannerul și a vă schimba alegerea:</p>
        <CookiePreferencesButton />
      </section>

      <section>
        <h2 className='text-xl md:text-3xl leading-tight mb-4 mt-6 font-bold'>Securitate</h2>
        <p className='font-Spacegrotesc'>Aplicăm măsuri tehnice și organizatorice rezonabile pentru a proteja datele (de exemplu stocarea parolelor sub formă de hash și accesul restricționat). Cu toate acestea, nicio metodă de transmitere sau stocare nu este 100% sigură și nu putem garanta securitatea absolută. Nu transmiteți date personale sensibile prin conținutul public al Platformei.</p>
      </section>

      <section>
        <h2 className='text-xl md:text-3xl leading-tight mb-4 mt-6 font-bold'>Minori</h2>
        <p className='font-Spacegrotesc'>Platforma nu este destinată persoanelor sub 16 ani și nu colectăm cu bună știință date de la copii sub această vârstă. Dacă aflăm că am colectat astfel de date fără temei, le vom șterge.</p>
      </section>

      <section>
        <h2 className='text-xl md:text-3xl leading-tight mb-4 mt-6 font-bold'>Vizitatorii din Uniunea Europeană (GDPR)</h2>
        <p className='font-Spacegrotesc'>Dacă accesați Platforma din Uniunea Europeană, prelucrarea datelor dvs. respectă Regulamentul (UE) 2016/679 (GDPR). Vă sunt garantate drepturile descrise mai sus, inclusiv dreptul la portabilitate și dreptul de a depune o plângere la autoritatea de protecție a datelor din statul dvs. de reședință. Temeiurile legale ale prelucrării sunt cele indicate în secțiunea „Scopurile și temeiurile legale”.</p>
      </section>

      <section>
        <h2 className='text-xl md:text-3xl leading-tight mb-4 mt-6 font-bold'>Modificări ale politicii</h2>
        <p className='font-Spacegrotesc'>Putem actualiza periodic această politică. Modificările intră în vigoare la publicarea pe această pagină, iar data ultimei actualizări este afișată la început. În cazul unor schimbări semnificative, vom afișa o notificare vizibilă pe Platformă.</p>
      </section>

      <section>
        <h2 className='text-xl md:text-3xl leading-tight mb-4 mt-6 font-bold'>Contact</h2>
        <p className='font-Spacegrotesc'>Pentru orice întrebare privind prelucrarea datelor sau pentru exercitarea drepturilor dvs., ne puteți contacta la <a className='text-myorange underline' href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
        <p className='font-Spacegrotesc mt-3 text-sm opacity-80'>Operator: {OPERATOR_NAME}, IDNO {OPERATOR_IDNO}, {OPERATOR_ADDRESS}.</p>
      </section>
    </article>
  )
}

export default Privacy
