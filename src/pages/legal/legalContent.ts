/**
 * Juridiske UDKAST (spec pkt. 18). Alle tekster er skabeloner med placeholders
 * og skal gennemgås og godkendes af virksomheden/juridisk rådgiver før lancering.
 * I produktion kan indholdet overstyres fra legal_documents-tabellen.
 */

export interface LegalDoc {
  title: string;
  version: string;
  sections: Array<{ heading?: string; body: string }>;
}

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  privatlivspolitik: {
    title: "Privatlivspolitik",
    version: "v0.1-udkast",
    sections: [
      { heading: "Dataansvarlig", body: "[JURIDISK NAVN], [ADRESSE], CVR [CVR-NUMMER], er dataansvarlig for behandlingen af dine personoplysninger. Kontakt: [TELEFON] / [E-MAIL]." },
      { heading: "Formål med behandlingen", body: "Vi behandler dine oplysninger for at (1) besvare henvendelser og forespørgsler om biler, (2) vurdere din bil og give dig et tilbud, når du bruger salgsvurderingen, (3) gennemføre bilhandler og opfylde aftaler, (4) sende markedsføring, hvis du har givet særskilt samtykke, og (5) forbedre hjemmesiden via statistik, hvis du har accepteret statistikcookies." },
      { heading: "Kategorier af personoplysninger", body: "Kontaktoplysninger (navn, telefon, e-mail, postnummer), oplysninger om din bil (nummerplade, kilometerstand, stand, billeder), tekniske køretøjsdata hentet via vores nummerplade-dataleverandør, kommunikationshistorik samt tekniske data (enhedstype, henvisningskilde og kampagneparametre)." },
      { heading: "Behandlingsgrundlag", body: "Behandlingen sker på grundlag af dit samtykke (GDPR art. 6, stk. 1, litra a) for markedsføring, opfyldelse af aftale eller skridt forud for aftale (litra b) for bilvurdering og handel, samt vores legitime interesse (litra f) i at besvare henvendelser og drive forretningen." },
      { heading: "Modtagere og databehandlere", body: "Vi bruger databehandlere til drift af hjemmesiden og behandling af henvendelser: [HOSTINGLEVERANDØR – fx Vercel], Supabase (database og filer), [NUMMERPLADE-DATALEVERANDØR], [E-MAILLEVERANDØR – fx Resend] samt – ved samtykke – Google (Analytics/Ads) og Meta. Databehandleraftaler er indgået med alle databehandlere. [BEKRÆFT LISTEN FØR LANCERING]." },
      { heading: "Overførsel til tredjelande", body: "Nogle leverandører kan behandle data i lande uden for EU/EØS. Overførsel sker i så fald på grundlag af EU-Kommissionens standardkontraktbestemmelser eller tilsvarende garantier. [GENNEMGÅ PR. LEVERANDØR FØR LANCERING]." },
      { heading: "Opbevaringsperioder", body: "Salgshenvendelser og tilhørende oplysninger opbevares i [PERIODE – SKAL FASTLÆGGES OG GODKENDES AF VIRKSOMHEDEN, fx X måneder efter afsluttet dialog]. Bogføringsmateriale opbevares i 5 år jf. bogføringsloven. Markedsføringssamtykker opbevares, så længe samtykket er aktivt, og dokumentation herfor i 2 år efter tilbagetrækning." },
      { heading: "Dine rettigheder", body: "Du har ret til indsigt, berigtigelse, sletning, begrænsning af behandling, dataportabilitet og indsigelse. Har du givet samtykke, kan du til enhver tid trække det tilbage med virkning for fremtiden ved at kontakte os på [E-MAIL]." },
      { heading: "Klage", body: "Du kan klage over vores behandling af dine personoplysninger til Datatilsynet, Carl Jacobsens Vej 35, 2500 Valby, www.datatilsynet.dk." },
      { heading: "Version", body: "Version [0.1 – UDKAST]. Senest opdateret [DATO INDSÆTTES VED GODKENDELSE]." },
    ],
  },
  cookiepolitik: {
    title: "Cookiepolitik",
    version: "v0.1-udkast",
    sections: [
      { heading: "Hvad er cookies?", body: "Cookies er små tekstfiler, der gemmes på din enhed, når du besøger en hjemmeside. Vi bruger dem til at få siden til at fungere og – kun med dit samtykke – til statistik og marketing." },
      { heading: "Kategorier", body: "Nødvendige: kræves for basale funktioner, herunder dit cookievalg. Funktionelle: husker dine præferencer (fx kortvisning). Statistik: anonymiseret måling af brugen af siden (fx Google Analytics 4). Marketing: måling og målretning af annoncer (fx Google Ads og Meta Pixel). Ikke-nødvendige cookies sættes først, når du har givet samtykke." },
      { heading: "Ændr dit valg", body: "Du kan til enhver tid ændre eller trække dit samtykke tilbage via “Cookieindstillinger” i bunden af siden." },
      { heading: "Cookieliste", body: "[KOMPLET COOKIELISTE MED NAVN, FORMÅL, UDLØB OG LEVERANDØR INDSÆTTES, NÅR TRACKING-ID'ER ER KONFIGURERET – fx via cookiescanning før lancering.]" },
      { heading: "Version", body: "Version [0.1 – UDKAST]. Senest opdateret [DATO]." },
    ],
  },
  handelsbetingelser: {
    title: "Handelsbetingelser",
    version: "v0.1-udkast",
    sections: [
      { heading: "Virksomhedsoplysninger", body: "[JURIDISK NAVN], [ADRESSE], CVR [CVR-NUMMER], telefon [TELEFON], e-mail [E-MAIL]." },
      { heading: "Anvendelse", body: "Disse betingelser gælder for køb og salg af biler hos [VIRKSOMHEDSNAVN]. Hjemmesidens annoncer er en opfordring til at gøre tilbud – en bindende aftale indgås først ved underskrevet slutseddel/købsaftale." },
      { heading: "Priser og betaling", body: "Alle priser er i danske kroner inkl. moms/afgifter, medmindre andet fremgår (fx biler uden afgift eller engrospriser). Der tages forbehold for tastefejl, mellemsalg og prisændringer. [BETALINGSVILKÅR INDSÆTTES]." },
      { heading: "Reklamation og garanti", body: "Ved forbrugerkøb gælder købelovens reklamationsregler (24 måneder for oprindelige mangler). Herudover tilbyder vi garantier på udvalgte biler i samarbejde med AutoConcept – se de konkrete vilkår for den enkelte bil eller kontakt os for detaljer." },
      { heading: "Køb af din bil", body: "Tilbud afgivet via salgsvurderingen er vejledende og uforpligtende for begge parter, indtil bilen er besigtiget og en skriftlig aftale er indgået. Tilbud forudsætter, at bilens stand svarer til de afgivne oplysninger." },
      { heading: "Version", body: "Version [0.1 – UDKAST]. Skal gennemgås juridisk før lancering." },
    ],
  },
  "vilkaar-bilvurdering": {
    title: "Vilkår for bilvurdering",
    version: "v0.1-udkast",
    sections: [
      { heading: "Uforpligtende vurdering", body: "Bilvurderingen er gratis og uforpligtende. Et afgivet bud er vejledende, indtil bilen er fysisk besigtiget, og forudsætter, at de afgivne oplysninger om bilen er korrekte og fyldestgørende." },
      { heading: "Dine oplysninger", body: "Nummerplade, kilometerstand, oplysninger om bilens stand og uploadede billeder bruges udelukkende til at vurdere bilen og kontakte dig om din henvendelse. Se privatlivspolitikken for detaljer om behandlingen." },
      { heading: "Køretøjsdata", body: "Tekniske køretøjsdata hentes fra [NUMMERPLADE-DATALEVERANDØR] på baggrund af nummerpladen. Vi henter ikke oplysninger om ejerforhold." },
      { heading: "Version", body: "Version [0.1 – UDKAST]." },
    ],
  },
  "juridiske-forbehold": {
    title: "Juridiske forbehold",
    version: "v0.1-udkast",
    sections: [
      { body: "Der tages forbehold for tastefejl, prisændringer, mellemsalg, ændrede afgifter samt fejl i bilernes angivne specifikationer og udstyr. Billeder kan vise ekstraudstyr, der ikke indgår i prisen. Oplysninger fra eksterne registre leveres uden garanti for fuldstændighed. [SUPPLERENDE FORBEHOLD INDSÆTTES EFTER JURIDISK GENNEMGANG.]" },
    ],
  },
  finansieringsforbehold: {
    title: "Finansieringsforbehold",
    version: "v0.1-udkast",
    sections: [
      { body: "Alle finansieringseksempler på hjemmesiden er vejledende og udgør ikke et tilbud. Endelige vilkår fastsættes af finansieringsselskabet efter individuel kreditvurdering. [LOVPLIGTIGE STANDARDOPLYSNINGER (ÅOP, samlede kreditomkostninger, løbetid m.v.) OG FINANSIERINGSPARTNERENS GODKENDTE TEKST INDSÆTTES FØR LANCERING – kræves jf. kreditaftaleloven og markedsføringsloven.]" },
    ],
  },
  klagevejledning: {
    title: "Klagevejledning",
    version: "v0.1-udkast",
    sections: [
      { heading: "Klag først til os", body: "Er du utilfreds, så kontakt os på [TELEFON] eller [E-MAIL] – vi finder som regel en løsning." },
      { heading: "Klageinstanser", body: "Fører dialogen ikke til en løsning, kan du som forbruger klage til Center for Klageløsning / Forbrugerklagenævnet via naevneneshus.dk. Du kan også bruge EU-Kommissionens onlineklageportal: ec.europa.eu/odr. [BEKRÆFT KORREKT KLAGEINSTANS FOR BILKØB FØR LANCERING.]" },
    ],
  },
};
