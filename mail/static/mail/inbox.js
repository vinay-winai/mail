document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => loadMailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => loadMailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => loadMailbox('archive'));
  document.querySelector('#compose').addEventListener('click', composeEmail);
  document.querySelector('#compose-form').addEventListener('submit', sendMail);


  // By default, load the inbox
  loadMailbox('inbox');
});

function composeEmail() {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-view').style.display = 'none';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function readMail(id,mailbox){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'block';
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector('#read-view').innerHTML = `
    <b>From: </b>${email.sender}<br>
    <b>To: </b>${email.recipients}<br>
    <b>Subject: </b>${email.subject}<br>
    <b>Timestamp: </b>${email.timestamp}<br><br>
    <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button> `
    // archive
    if (mailbox != 'sent'){
      const archiveBtn= document.createElement('button');
      archiveBtn.className = email.archived? 'btn btn-sm btn-outline-danger' : 'btn btn-sm btn-outline-success';
      archiveBtn.innerHTML = email.archived? 'Unarchive' : 'Archive';
      document.querySelector('#read-view').append(archiveBtn);
      archiveBtn.addEventListener('click',function(){
        console.log('This element has been clicked!');
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          })
        })
        .then(()=>loadMailbox('inbox'));
      });
    }
    const body = document.createElement('div');
    body.innerHTML=`<hr>${email.body}`;
    document.querySelector('#read-view').append(body);
    // change to read
    if (!email.read){
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
    }
    // reply
    document.querySelector('#reply').onclick = function(){
      composeEmail()
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = '';
      document.querySelector('#compose-body').value = '';
    }
  });
}

function loadMailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // show mail preview
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {
        const emailElement = document.createElement('div');
        emailElement.className = "list-group-item";
        const sndrLn=email.sender.length;
        emailElement.innerHTML = `<b>${email.sender}</b>`+'&nbsp;'.repeat(30-sndrLn)+`<strong>${email.subject}</strong>`+`<div id=time>${email.timestamp}</div>`;
        emailElement.style.background = email.read ?'gray':'white';
        emailElement.addEventListener('click', ()=>readMail(email.id,mailbox));
        document.querySelector('#emails-view').append(emailElement);   
      });
  });
}

function sendMail(e){
  e.preventDefault();
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      loadMailbox('sent');
  })
}
