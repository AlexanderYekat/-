package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

type Item struct {
	Code      string `json:"code"`
	GroupCode string `json:"groupCode"`
	IsGroup   bool   `json:"isGroup"`
	Name      string `json:"name"`
	Price     string `json:"price"`
}

func main() {
	items := readCSV("../base_utf.csv")

	//file, _ := os.Create("output.html")
	//defer file.Close()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		lp := filepath.Join("templates", "index.html")
		tmpl := template.Must(template.ParseFiles(lp))
		//tmpl.Execute(file, nil)
		//fmt.Println("-----")
		tmpl.Execute(w, nil)
	})

	http.HandleFunc("/data", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Println("fdfddf")
		json.NewEncoder(w).Encode(items)
	})

	// Добавляем обработку статических файлов
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Добавляем обработку статических файлов
	fsjs := http.FileServer(http.Dir("static/js"))
	http.Handle("/static/js/", http.StripPrefix("/static/js/", fsjs))

	// Добавляем обработку статических файлов
	fscss := http.FileServer(http.Dir("static/css"))
	http.Handle("/static/css/", http.StripPrefix("/static/css/", fscss))

	log.Println("Server starting on :8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func readCSV(filename string) []Item {
	file, err := os.Open(filename)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.Comma = ';'
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatal(err)
	}

	var items []Item
	for i, record := range records {
		if i == 0 { // Skip header
			continue
		}
		items = append(items, Item{
			Code:      record[0],
			GroupCode: record[1],
			IsGroup:   record[2] == "1",
			Name:      record[3],
			Price:     record[4],
		})
	}
	return items
}
