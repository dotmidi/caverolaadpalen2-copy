



// Post request om de email naar de backend en dan naar de database te sturen 
const SendData = async () =>
 {

  // kijk hier of de radio button als value radioklaar is. Zo ja gaat hij hierin.
  if(document.getElementById('RadioKlaar').checked)
  {
    let paalgeselecteerd = true;
    let bezet = false;
      
    // Hier is het van belang om de await en async methode te gebruiken. We willen dat hij eerst de response terug geeft.
    // Met deze response kunnen we dan verder mee werken, als we dit niet doen dan leest hij verder in de code en zijn sommige variabelen undefiend.
     const response = await axios.get('http://localhost:3000/charger')

     for(let i = 0; i < response.data.length;i++)
     {
       // Hier checkt de code of er een paal uberhaubt aan het laden is, als dat het geval is dan zet hij bezet op true. de status van de laadpalen halen we op op lijn 16.
       if(response.data[i].Status == 2)
       {
         bezet = true;
        
       }
     }

     // Als hij niet op lijn 23 komt, is bezet false, dit betekend dat er geen auto's op status 2 ( bezet ) staan. Het heeft dus geen nut voor de gebruiker om forum in te vullen.
     if(bezet == false)
     {
        document.getElementById("duplex").style.display = "none"; 
        document.getElementById("spelling").style.display = "none"; 
        document.getElementById("free").style.display = "none";
        document.getElementById("empty").style.display = "contents";
     }
     
    // Als alles goed is gegaan en er een laadpaal bezet is, kijkt hij hier welke laadpaal de gebruiker heeft aangeklikt met (.checked).
     if(bezet == true )
     {
      // Als 1 van de laadpalen gechecked zijn, zetten we de variable id op die ID die de laadpaal heeft. 
    if (document.getElementById('rc1').checked) { id = 8100969}
    else if (document.getElementById('rc2').checked) { id = 8100945}
    else if (document.getElementById('rc3').checked) { id = 9100432}
    else if (document.getElementById('rc4').checked) { id = 8100977}
    else if (document.getElementById('fc1').checked) { id = 7200930}
    else if (document.getElementById('fc2').checked) { id = 7200916}

    else( paalgeselecteerd = false , alert ("Selecteer een laadpaal") )

    // Met de ID van de geselecteerde laadpaal sturen we een put request naar de backend die op de ID van de laadpaal de email zet die de gebruiker heeft ingevult.
      
    if (paalgeselecteerd == true){

    axios.put('http://localhost:3000/charger/occupied', {
      id: id,
      email: document.getElementById("email").value,
      })
      document.getElementById("confirmationtekst").innerHTML = "We hebben je gegevens verwerkt. Je zult een email krijgen zodra je auto klaar is om op te laden!";
      showconfirmation();
    }
    }
}

// Als de gebruiker de radio button vrij heeft aangeklikt, gaat hij hierin.
if(document.getElementById('RadioVrij').checked)
  {
    let vrij = false;

    // hier hetzelfde met async en await. Anders loopt hij de code niet chronologisch door. Dit Komt door de axios functie.
    const response = await axios.get('http://localhost:3000/charger')

    for(let i = 0; i < response.data.length;i++)
      {
    
          // Hier checkt de code of er een palen vrij zijn, als dat het geval is dan zet hij vrij op true.
        if(response.data[i].Status == 1)
        {

          vrij = true;
        }
      }
      if(vrij == true)
      {
        // als vrij true is, betekend het dat er laadpalen vrij zijn, een gebruiker hoeft dan geen email notificatie te ontvangen.
        document.getElementById("duplex").style.display = "none"; 
        document.getElementById("spelling").style.display = "none"; 
        document.getElementById("free").style.display = "contents";
        document.getElementById("empty").style.display = "none";
      }

// Als vrij false is, betekend het dat er geen laadpalen vrij zijn, een gebruiker moet dan een email notificatie ontvangen.
if(!vrij){

  // Hier post hij de gegevens van de ingevulde velden naar de backend, deze worden dan in de database gezet ( in de wachtrij ).
  axios.post('http://localhost:3000/mail', {
    email: document.getElementById("email").value,
    emailnaam: document.getElementById("gebrnaam").value
    }).then(response => { console.log(response.data)
      // hier checken we of de email al in de database staat, dit kunnen we doen omdat we in de backend dit checken.
      // Als de backend Email bestaal al returned, betekend het dat de ingevulde email als bestaat in de database.
      if(response.data == "Email bestaat al"){
        document.getElementById("duplex").style.display = "contents"; 
        document.getElementById("spelling").style.display = "none"; 
        document.getElementById("free").style.display = "none";
        document.getElementById("empty").style.display = "none";
      }
      else
      {
        // als alles goed gaat laat hij de conformation zien met de aantal mensen in de wachtrij.
        GetWachtrij();
        document.getElementById("confirmationtekst").innerHTML = "We hebben je gegevens verwerkt. Je zult een email krijgen zodra er een laadpaal vrij is!";
        document.getElementById("confirmwachtrijtekst").innerHTML = "U staat op de wachtrij op plek nummer:";
        showconfirmation();
      }
    })
  }
  }
}


// Get request om het aantal wachtende mensen te krijgen
const GetWachtrij = () => {
  axios.get('http://localhost:3000/mail/wachtrij').then(response => {
    document.getElementById("demo").innerHTML = response.data;
  })

};

const GetStatus = () => {
  axios.get('http://localhost:3000/charger').then(response => {


    // Loopt door de ontvangen response heen, checkt de statusen van elke laadpaal en update ze dan met de bijbehorende afbeelding
    // We hebben in de frontend een ID genaamt Reg1, Reg2 , Reg3, Reg 4. Met de for loop vullen we reg met I + 1, omdat de for loop met 0 begint.
    // Dus bij de eerste loop is het document.getElementById("Reg1") en bij de tweede loop Reg2.
    // Als de status van response.data[i] 1, 2 of 3 is wordt de .src die in HTML staat verandert naar een andere .src, de gene die bij de status hoort.
    for( let i = 0; i < 4; i++){
      if(response.data[i].Status == 1){
        document.getElementById("Reg" + (i + 1)).src= "../Assets/Free.png"
      }
      else if(response.data[i].Status == 2){
        document.getElementById("Reg" + (i + 1)).src="../Assets/Charge.png"
      }
      else if(response.data[i].Status == 3){
        document.getElementById("Reg" + (i + 1)).src="../Assets/Wait.png"
      }
    }

    // Hier doen we precies hetzelfde, alleen zijn dit de snelladers en hebben dus een andere .src en andere id ( Fst1, Fst2)
    for(let j = 0; j < 2; j++){

      if(response.data[j + 4].Status == 1){
        document.getElementById("Fst" + (j + 1)).src= "../Assets/FastFree.png"
      }
      else if(response.data[j + 4].Status == 2){
        document.getElementById("Fst" + (j + 1)).src="../Assets/FastCharge.png"
      }
      else if(response.data[j + 4].Status == 3){
        document.getElementById("Fst" + (j + 1)).src="../Assets/FastWait.png"
      }
    }
  })
};


//  na een refresh van de website roept hij de status van de laadpalen op, hierdoor hebben we altijd de most up to date status.
window.onload = GetStatus();





function openPopup(input){
  document.getElementById(input).classList.add("open-popup");
}

function closePopup(input){
  document.getElementById(input).classList.remove("open-popup");
}

//Makes sure only one checkbox can be checked when clicking the charge icons
function DoCheckboxCheck(id){
  const chargers=["fc1","rc1","rc2","fc2","rc3","rc4"];
  document.getElementById(id).checked=!document.getElementById(id).checked;
  for (let index = 0; index < chargers.length; index++) {
    let thing=document.getElementById(chargers[index]);
    if (thing.id!=id) {
      thing.checked=false;
    }
    
  }
}
//makes sure only one checkbox can be checked when clicking the checkboxes themselves.
function JustUndoCheck(id){
  const chargers=["fc1","rc1","rc2","fc2","rc3","rc4"];
  for (let index = 0; index < chargers.length; index++) {
    let thing=document.getElementById(chargers[index]);
    if (thing.id!=id) {
      thing.checked=false;
    }
    
  }
}
//makes sure checkboxes disappear when "auto vrij" is checked.
function DoRadioCheck(id){
  document.getElementById(id).checked=false
  const thedebugs = document.getElementById("RadioVrij").checked
  if (document.getElementById("RadioVrij").checked==true) {
    document.getElementById("SelectBloc").classList.add("hidden")
  }
  else{
    document.getElementById("SelectBloc").classList.remove("hidden")
  }
}



// Laat de conformation zien wanneer de functie opgeroepen wordt.
function showconfirmation(){
    document.getElementById("succes").classList.add("open-popup");

    // Stuurt de gebruiker een email.
    sendemail();
}

// Check de input of er de email een @ heeft en of de velden wel ingevuld zijn of niet.
function mailcheck(){
  let regexemail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  let regexnaam = /^[a-zA-Z]+$/;
  let email = document.getElementById("email");
  let emailnaam = document.getElementById("gebrnaam");
  if (email.value.match(regexemail) && email.value.length != 0 && emailnaam.value.length != 0 && emailnaam.value.match(regexnaam)) {
    SendData();
  }
  else{
    document.getElementById("spelling").style.display = "contents"; 
    document.getElementById("duplex").style.display = "none"; 
    document.getElementById("free").style.display = "none";
    document.getElementById("empty").style.display = "none";
  }

}

function hideconf(){
  document.getElementById("succes").classList.remove("open-popup")
}
//adds attribute to classlist (used in tutorial pages)
function Open(element,attribute){
  document.getElementById(element).classList.add(attribute);
}
//removes attribute to classlist (used in tutorial pages)
function Close(element,attribute){
  document.getElementById(element).classList.remove(attribute);
}

//Invokes both Open and Close(used in tutorial pages)
function Swap(ElOp,AttOp,ElCl,AttCl){
  Open(ElOp,AttOp);
  Close(ElCl,AttCl);
  
}

// Vestuurt een email als de functie wordt opgeroepen. 
function sendemail(){
  let email = document.getElementById("email");
  let emailnaam = document.getElementById("gebrnaam");
  const dropdown = document.getElementById("dropdown");

  // send email depending on the option
  // REMOVED BECAUSE OF SMTP DETAILS


