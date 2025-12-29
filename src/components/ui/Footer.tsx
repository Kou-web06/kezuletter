'use client';

import { useState } from 'react';

export function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* フッター */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-4">
        <div className="flex items-center justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-gray-400 hover:text-gray-600 transition text-[12px] font-semibold cursor-pointer"
          >
            利用規約・プライバシーポリシー
          </button>
        </div>
      </footer>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-[500px] w-full max-h-[80vh] overflow-y-auto p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">利用規約・プライバシーポリシー</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 text-sm text-gray-700">
              {/* 利用規約 */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 text-base">利用規約</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">1. サービスの使用</h4>
                    <p>本サービス（KezuLetter）は、メッセージカードをスクラッチするエンターテイメントプラットフォームです。ユーザーは本サービスを個人目的でのみ使用することができます。</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">2. ユーザーの責任</h4>
                    <p>ユーザーが作成・送信したメッセージの内容に対して、全ての責任を持つものとします。不適切な内容の送信は禁止されています。</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">3. 免責事項</h4>
                    <p>本サービスは「現状のまま」提供されます。本サービスの使用によって生じた損害について、当事者は一切の責任を負いません。</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">4. 利用規約の変更</h4>
                    <p>本規約は予告なく変更される場合があります。変更後の規約に同意しない場合は、本サービスの使用を中止してください。</p>
                  </div>
                </div>
              </div>

              {/* プライバシーポリシー */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 text-base">プライバシーポリシー</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">1. 情報の収集</h4>
                    <p>本サービスは、メッセージ送信時に送信者名とメッセージ内容を収集します。これらの情報は暗号化されて処理されます。</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">2. 情報の使用</h4>
                    <p>収集した情報は、本サービスの提供と改善のためにのみ使用されます。第三者と共有することはありません。</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">3. Cookie および追跡技術</h4>
                    <p>本サービスは、ユーザーエクスペリエンスの向上のためにCookieを使用する場合があります。</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">4. セキュリティ</h4>
                    <p>ユーザー情報を保護するため、適切なセキュリティ対策を講じています。ただし、完全なセキュリティを保証することはできません。</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">5. プライバシーポリシーの変更</h4>
                    <p>本ポリシーは予告なく変更される場合があります。変更を通知する場合がありますが、本サイトへのアクセスは変更に同意したものとみなされます。</p>
                  </div>
                </div>
              </div>

              {/* お問い合わせ */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 text-base">お問い合わせ</h3>
                <p>本サービスに関するご質問やご不明な点がございましたら、GitHubの issue までお気軽にお問い合わせください。</p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-6 w-full bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
