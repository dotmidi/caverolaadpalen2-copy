//document.getElementById('authentication').style.display='block'; //show the authentication section
//document.getElementById('adminPanel').style.display='none'; //hide the admin panel section


function setChg(id){
   for (let index = 1; index < 7; index++) {
    document.getElementById(index).style.display="none";
    
   }
   document.getElementById(id).style.display="block";
}


const GetStatus = () => {
    axios.get('http://localhost:3000/charger').then(response => {
  
  
      // Loopt door de ontvangen response heen, checkt de statusen van elke laadpaal en update ze dan met de bijbehorende afbeelding
      for( let i = 0; i < 4; i++){
        if(response.data[i].Status == 1){
          document.getElementById("Reg" + (i + 1)).src= "../Assets/Free.png"
          document.getElementById("status" + (i + 1)).src= "../Assets/Free.png"
        }
        else if(response.data[i].Status == 2){
          document.getElementById("Reg" + (i + 1)).src="../Assets/Charge.png"
          document.getElementById("status" + (i + 1)).src= "../Assets/Charge.png"
        }
        else if(response.data[i].Status == 3){
          document.getElementById("Reg" + (i + 1)).src="../Assets/Wait.png"
          document.getElementById("status" + (i + 1)).src= "../Assets/Wait.png"
        }
      }
      for(let j = 0; j < 2; j++){
  
        if(response.data[j + 4].Status == 1){
          document.getElementById("Fst" + (j + 1)).src= "../Assets/FastFree.png"
          document.getElementById("statusfst" + (j + 1)).src= "../Assets/FastFree.png"
        }
        else if(response.data[j + 4].Status == 2){
          document.getElementById("Fst" + (j + 1)).src="../Assets/FastCharge.png"
          document.getElementById("statusfst" + (j + 1)).src= "../Assets/FastCharge.png"
        }
        else if(response.data[j + 4].Status == 3){
          document.getElementById("Fst" + (j + 1)).src="../Assets/FastWait.png"
          document.getElementById("statusfst" + (j + 1)).src= "../Assets/FastWait.png"
        }
      }
    })
  };
  
  
  //  na een refresh van de website roept hij de status van de laadpalen op
  window.onload = GetStatus();

  const laadpaalids = [8100969,8100945,9100432,8100977,7200930,7200916]
    let paalid = 0;
  const ChangeStatus = async (status) => 
  {
    for(let i = 1; i <= 6; i++){
        let x = document.getElementById(i.toString());
        if (window.getComputedStyle(x).display == "block")
        {
          paalid = laadpaalids[i-1];
        }
        
    }
    
    const response = await axios.put('http://localhost:3000/charger', { id: paalid, status : status});
    if(status == 1){
      axios.put('http://localhost:3000/charger/occupied', {
        id: paalid,
        email: "Placeholder",
        }).then(alert("De gebruiker die op deze laadpaal staat is verwijderd"))
    }

    location.reload();
  }


 async function sendemail(paal) {

    const response = await axios.get('http://localhost:3000/charger/' + paal)

    Email.send (
        {
        Host : "smtp.elasticemail.com",
        port:   2525,
        Username : "mikkodepoepslaaf@outlook.com",
        Password : "5064358FF0B85BF413F26CE147A363EF0EFD",
        To : response.data.OccupiedByEmail,
        From : 'caverolaadpalengroep4@outlook.com',
        Subject : "Reminder om je auto te ontkoppelen",
        Body : "Beste Heer/Mevrouw <br> <br> Dit is een reminder dat je auto vol is met laden alleen nog niet weg gehaalt is, haal hem zo snel mogelijk weg. <br> <br> Met vriendelijke groet, <br> <br> Cavero Laadpalen"
      }
    ).then(alert("Email is verstuurd naar " + response.data.OccupiedByEmail))
}