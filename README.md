# Wa make?

Een React Native applicatie voor het beheren van je vriezer-inventaris. Voeg producten en meal-preps toe, volg hun vervaldatum op en ontvang meldingen wanneer items binnenkort vervallen.

---

## Installatie-instructies

### Vereisten

- [Node.js](https://nodejs.org/) (v18 of hoger)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Android Studio](https://developer.android.com/studio) (voor Android emulator) of Xcode (voor iOS simulator)
- Expo Go app op een fysiek toestel (optioneel)

### Stappen

1. **Clone de repository**
   ```bash
   git clone <repository-url>
   cd ExamenPE
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Start de development server**
   ```bash
   npx expo start
   ```

4. **Open de app**
   - Druk op `a` om te openen in de Android emulator
   - Druk op `i` om te openen in de iOS simulator
   - Scan de QR-code met de Expo Go app op een fysiek toestel

### Opmerkingen

- Web mode (`w`) wordt **niet ondersteund** — verschillende native packages zoals `expo-secure-store`, `expo-notifications` en `@react-native-community/datetimepicker` werken niet in de browser.
- Push notificaties werken niet in Expo Go op iOS zonder extra configuratie. Op Android werken ze wel.
- Voor een productie-build: gebruik [EAS Build](https://docs.expo.dev/build/introduction/) (`eas build`). Het EAS project ID staat geconfigureerd in `app.json`.

---

## API-documentatie

### TheMealDB API

De app gebruikt de gratis publieke [TheMealDB API](https://www.themealdb.com/api.php) om maaltijdsuggesties op te halen op het startscherm.

Base URL: `https://www.themealdb.com/api/json/v1/1/`
Authenticatie: Geen (publieke API)
Gebruikte endpoint: `GET /search.php?f=b`

**Endpoint: zoek maaltijden op eerste letter** (voor demo)
```
GET https://www.themealdb.com/api/json/v1/1/search.php?f=b
```
Geeft een lijst van maaltijden terug waarvan de naam begint met de letter `b`. De app gebruikt de velden `idMeal`, `strMeal` en `strMealThumb` (thumbnail afbeelding).

**Caching:** de API-response wordt gecached in AsyncStorage onder de sleutel `cached_meals_b` met een TTL van 24 uur. Bij een cache-hit wordt de API niet opnieuw aangesproken.

### Lokale data (geen externe API)

Alle inventarisdata wordt lokaal opgeslagen — er is geen eigen backend.

AsyncStorage | `freezer_items_<username>` | JSON-array van alle items
AsyncStorage | `cached_meals_b` | Gecachede API-response + timestamp
SecureStore | `user_credentials` | `{ username, password }` als JSON
SecureStore | `user_session` | Gebruikersnaam van de ingelogde gebruiker

---

## Overzicht van de architectuur

```
App.js
├── SafeAreaProvider          (react-native-safe-area-context)
├── ItemProvider              (context/ItemContext.tsx)
│   └── NavigationContainer
│       └── StackNavigator    (navigation/StackNavigator.tsx)
│           ├── RegisterScreen
│           ├── LoginScreen
│           ├── Home
│           ├── DrawerNavigator (navigation/DrawerNavigator.tsx)
│           │   ├── TabNavigator (navigation/TabNavigator.tsx)
│           │   │   ├── Inventory
│           │   │   └── AddItem
│           │   └── Settings
│           └── ItemDetail
```

### Navigatie

De app gebruikt drie lagen van React Navigation:

- **StackNavigator** — de buitenste laag. Beheert authenticatie (Register/Login) en navigeert naar de hoofdapp. Controleert bij opstart via SecureStore welk scherm als startscherm wordt getoond.
- **DrawerNavigator** — de zij-menu navigatie, bereikbaar vanuit de hoofdapp. Bevat de tabnavigator en instellingen.
- **TabNavigator** — onderste tabbalk met twee tabs: het inventarisoverzicht en het formulier om items toe te voegen.

### State management

De app gebruikt de **React Context API** (`ItemContext`) voor globaal statusbeheer. De context stelt de volgende waarden beschikbaar aan alle schermen:

`items` | `any[]` | Alle vriezeritems van de ingelogde gebruiker
`addItem(item)` | `function` | Voegt een item toe en plant een notificatie
`updateItem(item)` | `function` | Werkt een item bij en herplant de notificatie
`deleteItem(id)` | `function` | Verwijdert een item en annuleert de notificatie

### Mappenstructuur

```
app/
├── context/
│   └── ItemContext.tsx       # Globale state + AsyncStorage + notificaties
├── navigation/
│   ├── StackNavigator.tsx    # Auth-check + root navigator
│   ├── DrawerNavigator.tsx   # Zijmenu
│   └── TabNavigator.tsx      # Onderste tabbalk
├── screens/
│   ├── Home.tsx              # Startscherm met maaltijdsuggesties
│   ├── Inventory.tsx         # Inventarisoverzicht met filters
│   ├── AddItem.tsx           # Formulier nieuw item
│   ├── ItemDetail.tsx        # Item bewerken/verwijderen
│   ├── Settings.tsx          # Statistieken + logout
│   ├── LoginScreen.tsx       # Inloggen
│   └── RegisterScreen.tsx    # Registreren
└── components/
    ├── ExpiryBadge.tsx       # Toont vervaldatum met status
    ├── FilterChip.tsx        # Herbruikbare filterknop
    └── ItemCard.tsx          # Kaartweergave van een item
```

---

## Lijst van geïmplementeerde functies

### Authenticatie
- Registreren met gebruikersnaam en wachtwoord (minimumvereisten + bevestiging)
- Inloggen met validatie en foutmeldingen per veld
- Veilige opslag van credentials via `expo-secure-store`
- Sessiebeheer: automatisch doorsturen naar het juiste scherm bij opstart
- Uitloggen via instellingen (sessie wordt gewist, navigatie gereset)
- Eén account per toestel — een tweede registratie wordt geblokkeerd met een duidelijke melding

### Inventarisbeheer
- Items toevoegen met naam, type (product of meal-prep) en vervaldatum
- Items bewerken en verwijderen via het detailscherm
- Per-gebruiker opslag: elke gebruiker heeft een eigen inventaris in AsyncStorage
- Automatisch opslaan bij elke wijziging

### Overzicht & filters
- Zoekbalk om items te filteren op naam
- Filteropties op status (goed / vervalt binnenkort / vervallen)
- Filteropties op type (product / meal-prep)
- Sorteren op recent toegevoegd, alfabetisch of vervaldatum
- Kleurgecodeerde statusbalk per item (groen / oranje / rood)
- Animeerbaar filterpaneel met open/sluit-animatie (react-native-reanimated)

### Notificaties
- Lokale push notificatie gepland 7 dagen vóór de vervaldatum van een item
- Als de vervaldatum minder dan 7 dagen weg is: notificatie na 5 seconden (voor testdoeleinden)
- Notificatie wordt geannuleerd bij verwijderen of bewerken van een item
- Notificatiepermissie wordt gevraagd bij opstarten

### Startscherm
- Maaltijdsuggesties opgehaald via TheMealDB API
- Caching van API-response (24 uur TTL) voor offline gebruik en snellere laadtijden
- Lazy loading: 5 items tegelijk, meer laden bij scrollen
- Laadspinner tijdens het ophalen van data

### Instellingen
- Weergave van ingelogde gebruiker
- Live statistieken: totaal aantal items, aantal per status
- Netwerkstatus (online/offline) via `@react-native-community/netinfo`

---

## Bekende problemen en beperkingen

### Eén account per toestel
De app ondersteunt slechts één account per toestel. `expo-secure-store` slaat credentials op onder één vaste sleutel. Een tweede registratie wordt nu geblokkeerd, maar er is geen mogelijkheid om het account te verwijderen vanuit de app zelf (enkel via "App data wissen" in de Android-instellingen).

### Geen wachtwoord-reset
Er is geen functionaliteit om een vergeten wachtwoord te resetten. Als de gebruiker zijn wachtwoord vergeet, is het enige alternatief het wissen van de app-data.

### Notificaties op iOS via Expo Go
Lokale notificaties werken niet volledig in Expo Go op iOS zonder een development build. Op Android (emulator en fysiek toestel) werken ze correct.

### Maaltijdsuggesties beperkt tot één letter
De TheMealDB-zoekopdracht haalt enkel maaltijden op die beginnen met de letter "b". Dit is een bewuste keuze voor de demo, maar beperkt de verscheidenheid van de suggesties.

### Geen beveiliging van wachtwoorden
Wachtwoorden worden als plaintext opgeslagen in SecureStore. SecureStore versleutelt de opslag op OS-niveau, maar er wordt geen extra hashing (zoals bcrypt) toegepast. Voor een productie-app zou dit aangepakt moeten worden.

---

## Toekomstige verbeteringen

- **Wachtwoord hashing** — wachtwoorden hashen met bcrypt of een vergelijkbare bibliotheek vóór opslag
- **Account verwijderen** — optie toevoegen in instellingen om het account en alle bijbehorende data te wissen
- **Meerdere accounts** — credentials opslaan als een lijst zodat meerdere gebruikers op hetzelfde toestel kunnen wisselen
- **Categorieën** — naast "product" en "meal-prep" vrije categorieën laten aanmaken
- **Foto's per item** — cameratoegang toevoegen zodat gebruikers een foto aan een item kunnen koppelen
- **Barcode scanner** — productnaam automatisch invullen via barcode scan
- **Betere maaltijdsuggesties** — maaltijdsuggesties geven op basis van items die binnenkort vervallen

---

## Teststrategie

### Manuele tests uitgevoerd

Alle functionaliteit is manueel getest op:
- Android emulator (Android Studio)
- Fysiek Android-toestel (APK via EAS Build)
- Mensen mijn app laten testen om te zien als alles duidelijk is om te gebruiken.
