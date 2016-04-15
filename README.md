# Web scraper v.0.1
#### Ogólnie to ten scraper umożliwi ci:
#### Teraz
* Wczytanie zastępstw z danego dnia
    
#### W przyszłości
W przyszłości zamierzam dodać do niego filtrowanie po klasach, czyli załóżmy, że jesteś z 1C i chcesz znać zastępstwa tylko, które dotyczą ciebie. Scraper na początku zeskanuje plan danej klasy, zindeksuje nauczycieli i przefiltruje wyniki przez tych nauczycieli.

#### Wykorzystanie

##### Bindowanie zmian: 

Łącze: *link/status/ **[day]** / **[sessionID]***
Parametry: ***[day]*** * - today* lub *tomorrow*, ***[sessionID]*** - info na dole
Wiadomości zwrotne: ***0 lub 1***

##### Wczytywanie zwolnień: 

Łącze: *link/scrape/ **[day]** / **[sessionID]***
Parametry: ***[day]*** * - today* lub *tomorrow*, ***[sessionID]*** - info na dole
Wiadomości zwrotne: ***0 lub 1***

**sessionID**: Tutaj podajesz jakieś ID, tak aby aplikacja potem wiedziała czy już brałeś dane czy nie z danego telefonu (appki mobilnej). Aby bindowanie zmian działało poprawnie, każda instancja twojej apki musi posiadać inne sessionID.