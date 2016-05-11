<?php

namespace app\core;

class Scraper {

    protected $link = "http://atlas.paderewski.lublin.pl/~konwerter/zastepstwa/zastepstwa_{DATE}.html";
    protected $schedule = "http://www.paderewski.lublin.pl/plany/lic/plany/o{CLASSID}.html";

    public function status($date)
    {

    }

    public function initials($classID)
    {
        $link = str_replace("{CLASSID}", $classID, $this->schedule);
        $s = $this->loadPageHTML($link);
        $s = explode("class=\"n\"", $s);
        unset($s[0]);
        $initials = [];
        foreach ($s as $record)
        {
            $initial = strtolower($record[2] . $record[1]);
            array_push($initials, $initial);
        }
        $initialsUnique = array_unique($initials);
        return $initialsUnique;
    }

    public function scrape($date, $classID)
    {
        $link = str_replace("{DATE}", $date, $this->link);
        $html = $this->loadPageHTML($link);
        $html = $this->fetchdata($html, "<TABLE BORDER=0 BORDERCOLOR=black CELLSPACING=0 CELLPADDING=2 style='border-collapse: collapse'>", "</TABLE>");
        $html = $this->initialCleaning($html);
        if ($classID == "false")
        {
            $html = $this->thoroughCleaning($html, false);
        } else {
            $html = $this->thoroughCleaning($html, $this->initials($classID));
        }

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

    protected function thoroughCleaning($html, $initials)
    {
        $TABLE = [];

        foreach ($html as $teacher)
        {
          $teachersName = $teacher[0];
          unset($teacher[0]);
          $lessons = [];
          foreach ($teacher as $lesson)
          {
            $lesson = str_replace('<TD>', '', $lesson);
            $lesson = str_replace('</TR>', '', $lesson);
            $lesson = str_replace('&nbsp;', '', $lesson);
            $lesson = explode('</TD>', $lesson);
            if ($lesson[0] !== "")
            {
              array_push($lessons, [
                'lekcja'    => $lesson[0],
                'opis'      => $lesson[1],
                'zastepca'  => $lesson[2],
                'uwagi'     => $lesson[3]
              ]);
            }
          }
          array_push($TABLE, [
            'teacher' => $teachersName,
            'lessons' => $lessons
          ]);
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
