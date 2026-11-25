<?php
/**
 * Nimmt das Kontaktformular der Website entgegen und schickt die Anfrage per E-Mail.
 * Keine Datenbank, keine fremden Dienste: nur der Mailversand des Hosters.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const EMPFAENGER   = 'paul.web@outlook.de';
const ABSENDER     = 'website@fastraone.de';      // muss zur Domain gehoeren, sonst filtern Mailserver
const BETREFF      = 'Neue Anfrage über die Website';
const MINDESTZEIT  = 3000;                        // Millisekunden, schneller fuellt nur ein Bot aus

function raus(bool $ok, string $meldung = '', int $code = 200): void {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'meldung' => $meldung], JSON_UNESCAPED_UNICODE);
    exit;
}

function sauber(string $wert, int $max = 400): string {
    $wert = trim($wert);
    $wert = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $wert);   // Header-Injection verhindern
    return mb_substr($wert, 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    raus(false, 'Nur POST.', 405);
}

// Honigtopf: ein ausgefuelltes unsichtbares Feld heisst Bot. Wir antworten freundlich und schicken nichts.
if (!empty($_POST['website'] ?? '')) {
    raus(true);
}

// Zu schnell abgeschickt heisst ebenfalls Bot.
$start = (int) ($_POST['start'] ?? 0);
if ($start > 0 && (int) round(microtime(true) * 1000) - $start < MINDESTZEIT) {
    raus(true);
}

$name      = sauber((string) ($_POST['name'] ?? ''), 120);
$betrieb   = sauber((string) ($_POST['betrieb'] ?? ''), 160);
$email     = sauber((string) ($_POST['email'] ?? ''), 180);
$telefon   = sauber((string) ($_POST['telefon'] ?? ''), 60);
$nachricht = trim((string) ($_POST['nachricht'] ?? ''));
$nachricht = mb_substr(str_replace(["\r\n", "\r"], "\n", $nachricht), 0, 4000);

if ($name === '' || $email === '') {
    raus(false, 'Name und E-Mail fehlen.', 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    raus(false, 'Die E-Mail-Adresse sieht nicht gültig aus.', 422);
}

$zeit = (new DateTimeImmutable('now', new DateTimeZone('Europe/Berlin')))->format('d.m.Y, H:i');

$text = <<<TEXT
Neue Anfrage über die Website

Name:     {$name}
Betrieb:  {$betrieb}
E-Mail:   {$email}
Telefon:  {$telefon}

Anliegen:
{$nachricht}

Eingegangen: {$zeit} Uhr
TEXT;

$kopf = [
    'From: Website <' . ABSENDER . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$betreff = BETREFF . ($betrieb !== '' ? ' – ' . $betrieb : '');
$gesendet = @mail(EMPFAENGER, $betreff, $text, implode("\r\n", $kopf), '-f' . ABSENDER);

if (!$gesendet) {
    // Als Sicherheitsnetz die Anfrage lokal ablegen, damit nichts verloren geht.
    @file_put_contents(
        __DIR__ . '/anfragen.log',
        '[' . $zeit . '] ' . str_replace("\n", ' | ', $text) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
    raus(false, 'Der Mailversand hat nicht geklappt.', 500);
}

raus(true);
