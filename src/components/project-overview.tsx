import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function ProjectOverview() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">CBZHotels Database System Project</h1>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">1. Projektbeskrivelse og Krav</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <p className="mb-4">
            Velkommen til CBZHotels Database System projektet. Jeg er ansvarlig for at udvikle et centralt databasesystem for CBZHotels, en hotelkæde bestående af 5 hoteller.
          </p>
          <p className="mb-4">
            <strong>Projektbeskrivelse:</strong> CBZHotels har brug for et centralt database system til at håndtere bookinger, gæster, værelser og personale. Systemet skal også kunne håndtere konferencefaciliteter og særlige arrangementer.
          </p>
          <p className="mb-4">
            <strong>Hovedkrav:</strong>
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>Centraliseret styring af 5 hoteller</li>
            <li>Håndtering af bookinger og gæster</li>
            <li>Administration af værelser og personale</li>
            <li>Integration af konferencefaciliteter</li>
            <li>Håndtering af særlige arrangementer</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">2. Booking System</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="bg-black p-3 rounded-lg mb-4">
            <Image
              src="/billede.png"
              alt="Booking System Sequence Diagram"
              width={600}
              height={450}
              className="w-full"
            />
          </div>
          <p className="mb-4">
            Booking systemet følger en sekventiel proces med fire hovedaktører:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li><strong>Gæst:</strong> Starter processen ved at anmode om en booking</li>
            <li><strong>Reception:</strong> Håndterer kommunikationen mellem gæst og system</li>
            <li><strong>System:</strong> Koordinerer booking processen og kommunikerer med databasen</li>
            <li><strong>Database:</strong> Lagrer og henter information om ledige værelser og bookinger</li>
          </ul>
          <p className="mb-4">
            Processen forløber således:
          </p>
          <ol className="list-decimal pl-5 mb-4">
            <li>Gæsten anmoder om en booking</li>
            <li>Systemet tjekker tilgængelighed i databasen</li>
            <li>Databasen returnerer ledige værelser</li>
            <li>Receptionen præsenterer valgmuligheder for gæsten</li>
            <li>Gæsten bekræfter bookingen</li>
            <li>Systemet gemmer bookingen i databasen</li>
            <li>Gæsten modtager endelig bekræftelse</li>
          </ol>
          <p className="mb-4">
            For at tjekke værelsestilgængelighed bruges følgende SQL-forespørgsel:
          </p>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto font-mono text-sm">
            <code className="text-foreground">
              {`SELECT v.værelse_id, v.værelse_nummer, v.værelse_type
FROM Værelser v
LEFT JOIN Bookinger b ON v.værelse_id = b.værelse_id
  AND b.check_ud_dato > CURRENT_DATE
  AND b.check_ind_dato < DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)
WHERE b.booking_id IS NULL
  AND v.hotel_id = 1;`}
            </code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">3. Rabathåndtering</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="mb-4">
            Vi har implementeret et automatisk rabatsystem ved hjælp af en SQL trigger. Her er triggerens funktionalitet:
          </p>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto font-mono text-sm">
            <code className="text-foreground">
              {`CREATE TRIGGER beregn_rabat
BEFORE INSERT ON Bookinger
FOR EACH ROW
BEGIN
    SET NEW.total_pris = 
        CASE 
            WHEN NEW.fdm_medlem THEN NEW.basis_pris * 0.88
            WHEN NEW.online_booking THEN NEW.basis_pris * 0.90
            ELSE NEW.basis_pris
        END;
END;`}
            </code>
          </pre>
          <p className="mb-4">
            Denne trigger aktiveres før en ny booking indsættes og beregner automatisk den samlede pris baseret på rabatter:
          </p>
          <ul className="list-disc pl-5">
            <li>FDM-medlemmer modtager 12% rabat (pris * 0.88)</li>
            <li>Online bookinger får 10% rabat (pris * 0.90)</li>
            <li>Hvis ingen rabat er gældende, anvendes basis prisen</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

