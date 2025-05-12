import { useState } from 'react';
import { Award, CheckCircle, Loader, QrCode, ExternalLink } from 'lucide-react';

export default function TokenClaimInterface() {
  const [claimState, setClaimState] = useState('initial'); // initial, processing, success
  const [connected, setConnected] = useState(false);
  
  const eventDetails = {
    name: "Solana Meetup #42",
    organizer: "Solana Bay Area",
    tokenName: "Solana Meetup Token",
    image: "/api/placeholder/300/300",
    date: "May 10, 2025"
  };
  
  const connectWallet = () => {
    setConnected(true);
  };
  
  const claimToken = () => {
    setClaimState('processing');
    
    // Simulate processing time
    setTimeout(() => {
      setClaimState('success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-purple-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award size={24} />
            <h1 className="text-xl font-bold">cToken POP</h1>
          </div>
          
          {connected ? (
            <div className="bg-purple-700 px-3 py-1 rounded-full text-sm flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
              Connected: 8WFE...j29P
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="bg-purple-700 px-3 py-1 rounded-full text-sm"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          {claimState === 'success' ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <CheckCircle size={64} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Token Claimed!</h2>
              <p className="text-gray-600 mb-6">
                You've successfully claimed your proof of participation token.
              </p>
              
              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <img src={eventDetails.image} alt="Token" className="w-20 h-20 rounded" />
                </div>
                <h3 className="font-bold">{eventDetails.tokenName}</h3>
                <p className="text-sm text-gray-500">{eventDetails.name}</p>
              </div>
              
              <div className="flex justify-center">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  View in Wallet
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <img src={eventDetails.image} alt={eventDetails.name} className="w-full h-40 object-cover rounded-lg mb-4" />
                <h2 className="text-xl font-bold">{eventDetails.name}</h2>
                <p className="text-gray-600">By {eventDetails.organizer}</p>
                <p className="text-sm text-gray-500">{eventDetails.date}</p>
              </div>
              
              <div className="border-t border-b border-gray-200 py-4 mb-6">
                <h3 className="font-medium mb-2">Claim Your Proof of Participation</h3>
                <p className="text-sm text-gray-600">
                  This compressed token (cToken) serves as proof that you attended this event. 
                  It will be stored in your Solana wallet using ZK Compression technology.
                </p>
              </div>
              
              {claimState === 'processing' ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <Loader size={32} className="text-purple-600 animate-spin mb-4" />
                  <p className="text-gray-600">Processing your claim...</p>
                </div>
              ) : (
                <button 
                  onClick={claimToken}
                  disabled={!connected}
                  className={`w-full py-3 rounded-md flex items-center justify-center ${
                    connected 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {connected ? 'Claim Token' : 'Connect Wallet to Claim'}
                </button>
              )}
              
              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Gas fees: ~0.000001 SOL</p>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>Powered by ZK Compression on Solana</p>
          <p className="flex items-center justify-center mt-1">
            <QrCode size={14} className="mr-1" />
            cToken Proof of Participation
          </p>
        </div>
      </footer>
    </div>
  );
}
