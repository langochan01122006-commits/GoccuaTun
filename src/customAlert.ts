export const customAlert = (message: string) => {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '20px';
  div.style.left = '50%';
  div.style.transform = 'translateX(-50%)';
  div.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
  div.style.color = 'white';
  div.style.padding = '12px 24px';
  div.style.borderRadius = '8px';
  div.style.zIndex = '999999';
  div.style.fontWeight = 'bold';
  div.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
  div.innerText = message;
  document.body.appendChild(div);
  setTimeout(() => {
    div.remove();
  }, 5000);
};

export const customConfirm = (message: string, onConfirm: () => void) => {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
  overlay.style.zIndex = '999999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';

  const modal = document.createElement('div');
  modal.style.backgroundColor = '#1e293b';
  modal.style.padding = '24px';
  modal.style.borderRadius = '12px';
  modal.style.border = '1px solid rgba(255,255,255,0.1)';
  modal.style.maxWidth = '300px';
  modal.style.textAlign = 'center';
  modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';

  const text = document.createElement('p');
  text.style.color = 'white';
  text.style.marginBottom = '20px';
  text.innerText = message;
  
  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '10px';
  btnRow.style.justifyContent = 'center';

  const btnCancel = document.createElement('button');
  btnCancel.innerText = 'Hủy';
  btnCancel.style.padding = '8px 16px';
  btnCancel.style.borderRadius = '6px';
  btnCancel.style.border = 'none';
  btnCancel.style.backgroundColor = '#475569';
  btnCancel.style.color = 'white';
  btnCancel.style.cursor = 'pointer';
  btnCancel.onclick = () => overlay.remove();

  const btnOk = document.createElement('button');
  btnOk.innerText = 'Đồng ý';
  btnOk.style.padding = '8px 16px';
  btnOk.style.borderRadius = '6px';
  btnOk.style.border = 'none';
  btnOk.style.backgroundColor = '#dc2626';
  btnOk.style.color = 'white';
  btnOk.style.cursor = 'pointer';
  btnOk.onclick = () => {
    overlay.remove();
    onConfirm();
  };

  btnRow.appendChild(btnCancel);
  btnRow.appendChild(btnOk);
  modal.appendChild(text);
  modal.appendChild(btnRow);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
};
