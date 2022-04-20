document.querySelector('#chat_id').focus();

function encryptWithXor(str, code) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ code);
  }
  return result;
}

function formatHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.querySelector('#select_chat_id').addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelector('#loader').style.display = 'inline-block';
  if (document.querySelector('#chat_id').value.length === 0) {
    document.querySelector('#chat_id').focus();
    document.querySelector('#loader').style.display = 'none';
    return;
  }
  fetch(
    'https://live-quick-chat.herokuapp.com/which/' +
      document.querySelector('#chat_id').value.replaceAll(' ', '')
  )
    .then((res) => res.text())
    .then((data) => {
      document.querySelector('#loader').style.display = 'none';
      if (data === 'gr') {
        document.querySelector('#chat_id').value = '';
        document.querySelector('#chat_id').focus();
        document.querySelector('#chat_form').hidden = true;
        return;
      }
      document.querySelector('#chat_form').hidden = false;
      document.querySelector('#message').focus();
      document.querySelector('#user').innerHTML = data;
      document.querySelector('#chat_id_form').hidden = true;
      document.querySelector('#show_id').innerHTML =
        document.querySelector('#chat_id').value + '<br />';
      document.querySelector('#show_id').hidden = false;
    });
  setInterval(() => {
    fetch(
      `https://live-quick-chat.herokuapp.com/updates/${
        document.querySelector('#user').innerHTML
      }/${document.querySelector('#chat_id').value}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          message = encryptWithXor(
            data.message,
            parseInt(document.querySelector('#chat_id').value)
          );
          document.querySelector('#logs').innerHTML =
            document.querySelector('#logs').innerHTML +
            `<div class="it"><span class="it">⚪ </span>Friend: ${formatHTML(
              message
            )}</div>`;
          document.querySelector('#logs').scrollTop =
            document.querySelector('#logs').scrollHeight;
        }
      });
  }, 1000);
});

document.querySelector('#send_button').addEventListener('click', (e) => {
  e.preventDefault();
  let message = document.querySelector('#message').value;
  const chatId = document.querySelector('#chat_id').value;
  if (message === '') {
    return;
  }
  encodedMessage = encryptWithXor(message, parseInt(chatId));
  window.scrollTo(0, document.querySelector('#logs').scrollHeight);
  fetch(
    `https://live-quick-chat.herokuapp.com/send/${
      document.querySelector('#user').innerHTML
    }/${chatId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: encodedMessage,
      }),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        window.location.reload();
      } else {
        document.querySelector('#logs').innerHTML = document
          .querySelector('#logs')
          .innerHTML.replaceAll(
            `<div class="nit"><span class="it">🔴 </span>You: ${formatHTML(
              message
            )}<br></div>`,
            `<div class="it"><span class="it">🟢 </span>You: ${formatHTML(
              message
            )}<br></div>`
          );
        document.querySelector('#logs').scrollTop =
          document.querySelector('#logs').scrollHeight;
      }
    });
  document.querySelector('#logs').innerHTML =
    document.querySelector('#logs').innerHTML +
    `<div class="nit"><span class="it">🔴 </span>You: ${formatHTML(
      message
    )}<br></div>`;
  document.querySelector('#message').value = '';
  document.querySelector('#logs').scrollTop =
    document.querySelector('#logs').scrollHeight;
});

function enterHandler() {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.querySelector('#send_button').click();
  }
}

function numberHandler() {
  if (!/[0-9]/.test(event.key)) {
    if (event.keyCode !== 13) {
      event.preventDefault();
    }
  }
  if (document.querySelector('#chat_id').value.length >= 5) {
    if (event.keyCode !== 13) {
      event.preventDefault();
    }
  }
}
