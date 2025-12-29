import CryptoJS from 'crypto-js';

const SECRET_KEY = 'kezuletter-local-key'; // ハッカソンなら簡易的でOK

export const useCrypto = () => {
  // テキストを暗号化してURLセーフな文字列にする
  const encrypt = (text: string) => {
    const ciphertext = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    // Base64をURLで使いやすい形式に置換
    return btoa(ciphertext).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  // URLから受け取った文字列を復号する
  const decrypt = (encoded: string) => {
    try {
      // 置換を元に戻してBase64デコード
      const ciphertext = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return '解読に失敗しました...';
    }
  };

  return { encrypt, decrypt };
};