window.onload = function(){
    console.log("appStarted!");
    booksList.init();
}

class Book{
    constructor(title, author, id){
        this.title = title;
        this.author = author;
        this.id = id;
    }

    getID(){
        return this.id;
    }

    getTitle(){
        return this.title;
    }

    getAuthor(){
        return this.author;
    }

}

function saveBookInDatabase(book){
    db.collection('BooksList').add({
        Author: book.getAuthor(),
        Title: book.getTitle(),
        ID: book.getID()
    });
}

// function deleteDataInDatabase(){
//     const booksListRef = db.collection('BooksList');
//     const snapshot = await booksListRef.get();
//     snapshot.forEach(doc => {
//         doc(doc.id).delete();
//     })
// }

class BooksList{
    constructor(){
        this.books = [];
    }

    init(){
        document.getElementById("saveButton").addEventListener("click", (e) => this.saveButton(e) );
        this.loadDataFromDataBase();
        console.log(this.books);
    }
    
    loadDataFromDataBase(){
        db.collection('BooksList').get().then((snapshot) => {
            snapshot.docs.forEach(doc => {
                this.addBookToParamAndUI(new Book(doc.data().Title, doc.data().Author, doc.data().ID));
            });
        });
    }

    loadDataFromStorage(){
        const data = storage.getItems();

        if(data == null || data == undefined) return;

        this.books = data;

        data.forEach((value, index) => {
            ui.addBookToTable(value);
        })
    }

    saveButton(e){
        console.log("save Button");
        
        const title = document.getElementById("bookTitle").value;
        const author = document.getElementById("bookAuthor").value;

        if(author === "" || title === ""){
            console.log("blank data");
            return;
        }

        e.preventDefault();
        const book = new Book(title, author, Date.now() + booksList.books.length);
        this.addBookToParamAndUI(book);
        saveBookInDatabase(book);
    }

    addBookToParamAndUI(book){
        this.books.push(book);
        ui.addBookToTable(book);
        this.saveDataInStorage();
    }

    removeBookByID(bookID){
        this.books.forEach((el, index) => {
            if(el.id == bookID){
                this.books.splice(index, 1);
            }
        })
        this.saveDataInStorage();

        console.log(this.books);
    }

    moveBookUp(bookID){
        let arr = this.books;

        for(let i = 0; i < arr.length; i++){
            let el = arr[i];

            if(el.id == bookID){
                if(i >= 1){
                    let tmp = arr[i-1];
                    arr[i-1] = arr[i];
                    arr[i] = tmp;
                    break;
                }
            }
        }

        this.saveDataInStorage();
        ui.deleteAllBookRows();
        this.loadDataFromStorage();
    }



    moveBookDown(bookID){
        let arr = this.books;
        console.log("przed", arr);

        for(let i = 0; i < arr.length; i++){
            let el = arr[i];

            if(el.id == bookID){
                if(i < arr.length-1){
                    let tmp = arr[i+1];
                    arr[i+1] = arr[i];
                    arr[i] = tmp;
                    break;
                }
            }
        }

        console.log("po", arr);
        this.saveDataInStorage();
        ui.deleteAllBookRows();
        this.loadDataFromStorage();
    }

    saveDataInStorage(){
        storage.saveItems(this.books);
    }

}

var booksList = new BooksList();

class UI{

    print(){
        console.log("it Works!");
    }

    deleteBook(e){
        const bookID = e.target.getAttribute("data-book-id");
        
        e.target.parentElement.parentElement.remove();
        booksList.removeBookByID(bookID);

        console.log("ID:", bookID);
        const dbRef = db.collection('BooksList').where('ID', '==', parseInt(bookID));
        dbRef.get().then(function(querry){
            querry.forEach(function(doc){
                doc.ref.delete();
                console.log("Removed:", bookID);
            });
        });

    }

    deleteAllBookRows(){
        const tBodyRows = document.querySelectorAll("#booksTable tbody tr");

        tBodyRows.forEach(function(el){
            el.remove();
        })
    }

    addBookToTable(book){
        
        const tbody = document.querySelector("#booksTable tbody");
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td> ${book.title} </td>
            <td> ${book.author} </td>
            <td> 
                <button type="button" data-book-id="${book.id}" class="btn btn-danger btn-sm delete">Delete</button>
                <button type="button" data-book-id="${book.id}" class="btn btn-secondary btn-sm up-arrow">🠕</button>
                <button type="button" data-book-id="${book.id}" class="btn btn-secondary btn-sm down-arrow">🠗</button>
            </td>
        `;

        tbody.appendChild(tr);

        let deleteButton = document.querySelector(`button.delete[data-book-id='${book.id}']`);
        deleteButton.addEventListener("click", (e) => this.deleteBook(e));
        
        let upButton = document.querySelector(`button.up-arrow[data-book-id='${book.id}']`);
        upButton.addEventListener("click", (e) => this.arrowUp(e));
        
        let downButton = document.querySelector(`button.down-arrow[data-book-id='${book.id}']`);
        downButton.addEventListener("click", (e) => this.arrowDown(e));
        
        
        this.clearForm();
    }

    arrowUp(e){
        let bookID = e.target.getAttribute("data-book-id");
        console.log("up", bookID);

        booksList.moveBookUp(bookID);
    }

    arrowDown(e){
        let bookID = e.target.getAttribute("data-book-id");
        console.log("up", bookID);

        booksList.moveBookDown(bookID);
    }

    clearForm(){
        document.getElementById("bookTitle").value = "";
        document.getElementById("bookAuthor").value = "";

        document.getElementById("bookForm").classList.remove("was-validated");
    }
}

const ui = new UI();

class Storage{

    getItems(){
        let books = null;

        if(localStorage.getItem("books") !== null){
            books = JSON.parse(localStorage.getItem("books"));
        }
        else{
            books = [];
        }

        return books;
    }

    saveItems(books){
        localStorage.setItem("books", JSON.stringify(books));
    }
}

const storage = new Storage();

///////////////////////////////////////////////////////////////////////////////////////////////

// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
  
          form.classList.add('was-validated')
        }, false)
      })
  })()