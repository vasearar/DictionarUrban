import React from "react";

// Butonul „Trage la sorți": ancoră normală (nu <Link>) ca navigarea completă să
// urmeze redirectul 307 de la /aleator → /cuvant/[slug] random. Tonul e pasiv-
// agresiv, în ton cu restul site-ului („Tu scrii DexUrban.md").
const RandomWord = () => {
  return (
    <div className="mx-auto text-center px-3 md:px-8 mb-10 mt-2">
      <p className="font-Spacegrotesc text-base lg:text-lg mb-5 text-myhovergray">
        Tot dai scroll și tot nu știi ce cauți? Lasă, alegem noi în locul tău.
      </p>
      <a
        href="/aleator"
        className="inline-block bg-myorange hover:bg-myhoverorange text-mywhite font-bold font-Spacegrotesc text-lg lg:text-xl border-2 border-mygray rounded-sm px-6 py-3 lg:px-8 lg:py-4 mydropshadow transition-colors"
      >
        Trage la sorți un cuvânt
      </a>
    </div>
  );
};

export default RandomWord;
