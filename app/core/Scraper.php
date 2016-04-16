<?php

namespace app\core;

class Scraper {

    protected $link = "http://atlas.paderewski.lublin.pl/~konwerter/zastepstwa/zastepstwa_{DATE}.html";

    public function status($date)
    {

    }

    public function scrape($date)
    {
        $link = str_replace("{DATE}", $date, $this->link);
        $html = $this->loadPageHTML($link);
        $html = $this->fetchdata($html, "<TABLE BORDER=0 BORDERCOLOR=black CELLSPACING=0 CELLPADDING=2 style='border-collapse: collapse'>", "</TABLE>");
        $html = $this->initialCleaning($html);
        $html = $this->thoroughCleaning($html);
        $json = json_encode($html);
        return $json;
    }

    protected function loadPageHTML($link)
    {
        $scrapedHTML = file_get_contents($link);
        // Trzeba na sile zmienic kodowanie, bo dziennik koduje w iso-8859-2 i wysypuje krzaki
        $scrapedHTML = iconv("iso-8859-2", "UTF-8", $scrapedHTML);
        return $scrapedHTML;
    }

    protected function thoroughCleaning($html)
    {
        $TABLE = [];

        foreach($html as $t)
        {
            // Usuniecie ostatniego indexu z kazdej tablicy, bo zawsze jest pusty
            $lastRecord =  sizeof($t) - 1;
            unset($t[$lastRecord]);

            // Oddzielenie nazwy nauczyciela
            $teacher = $t[0];
            unset($t[0]);

            //Pozbycie sie tagu </TR> oraz <TD>
            $t = str_replace("</TR>", "", $t);
            $t = str_replace("<TD>", "", $t);

            // Utworzenie wlasciwej struktury danych
            $separator = "</TD>";
            foreach ($t as $row)
            {
                $e = str_replace("&nbsp;", "", $row);
                $e = explode($separator, $e);
                $hour = $e[0];
                $desc = $e[1];
                $repl = $e[2];
                $impo = $e[3];

                $TABLE[$teacher][$hour]["opis"] = $desc;
                $TABLE[$teacher][$hour]["zastepca"] = $repl;
                $TABLE[$teacher][$hour]["uwagi"] = $impo;
            }

        }

        return $TABLE;
    }

    protected function initialCleaning($html)
    {
        $data = [];
        // To oddziela nauczycieli w tabeli
        $html = explode('<TD NOWRAP class=st1  COLSPAN=4 ALIGN=LEFT BGCOLOR=#FFDFBF>', $html);
        // Pierwszy rekord jest zawsze zbedny (data)
        unset($html[0]);
        $i = 0;
        foreach ($html as $teacher)
        {
            // Musimy wywalic tez dyzury, ktore siedza nam w tabeli
            if (strstr($teacher, "dyżury") !== false)
            {
                unset($html[$i]);
                continue;
            }

            // Wywalenie wszystkich niepotrzebnych rzeczy, aby dalo sie to dalej parsowac, bo jest tragedia..

            $pattern = " NOWRAP class=st{number}  ALIGN=LEFT";
            for ($ii = 0; $ii <= 20; $ii++)
            {
                $replace  = str_replace("{number}", $ii, $pattern);
                $teacher = str_replace($replace, "", $teacher);
            }

            $colors = [" BGCOLOR=#FFEBBF", " BGCOLOR=#F7F3D9"];
            foreach ($colors as $color)
            {
                $teacher = str_replace($color, "", $teacher);
            }

            // Wywalenie przejsc do nowych lini

            $teacher = preg_replace('/\n/', '', $teacher);

            // Wywalenie naglowkow

            $header = "</TD></TR><TR><TD>lekcja</TD><TD>opis</TD><TD>zastępca</TD><TD>uwagi   </TD></TR>";
            $teacher = str_replace($header, "", $teacher);

            // Wysoko oczyszczone dane ladujemuy do tablicy

            $teacher = explode("<TR>", $teacher);
            $data[$i] = $teacher;
            $i++;
        }

        return $data;
    }

    protected function fetchdata($data, $start, $end)
    {
        $data = stristr($data, $start);
        $data = substr($data, strlen($start));
        $stop = stripos($data, $end);
        $data = substr($data, 0, $stop);
        return $data;
    }
}
