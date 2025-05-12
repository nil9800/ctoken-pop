import { useState } from 'react';
import { QrCode, Plus, Check, Users, Award, Copy, ExternalLink } from 'lucide-react';

export default function CompressedTokenPOP() {
  const [activeTab, setActiveTab] = useState('create');
  const [createdEvents, setCreatedEvents] = useState([
    {
      id: '1',
      name: 'Solana Meetup #42',
      description: 'Monthly Solana developer meetup',
      tokenName: 'Solana Meetup Token',
      claimed: 24,
      total: 100,
      image: '/api/placeholder/300/300'
    }
  ]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  
  // Form state
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSupply, setTokenSupply] = useState(100);

  const handleCreateEvent = () => {
    const newEvent = {
      id: Date.now().toString(),
      name: eventName,
      description: eventDescription,
      tokenName: tokenName,
      claimed: 0,
      total: tokenSupply,
      image: '/api/placeholder/300/300'
    };
    
    setCreatedEvents([...createdEvents, newEvent]);
    
    // Reset form
    setEventName('');
    setEventDescription('');
    setTokenName('');
    setTokenSupply(100);
    
    // Switch to manage tab
    setActiveTab('manage');
  };

  const showQR = (event) => {
    setCurrentEvent(event);
    setShowQRModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="bg-purple-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award size={24} />
            <h1 className="text-xl font-bold">cToken POP Interface</h1>
          </div>
          <div className="bg-purple-700 px-3 py-1 rounded-full text-sm flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
            Connected: 8WFE...j29P
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('create')} 
              className={`px-6 py-4 font-medium flex items-center ${activeTab === 'create' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
            >
              <Plus size={18} className="mr-2" />
              Create Event
            </button>
            <button 
              onClick={() => setActiveTab('manage')} 
              className={`px-6 py-4 font-medium flex items-center ${activeTab === 'manage' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
            >
              <Users size={18} className="mr-2" />
              Manage Events
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {activeTab === 'create' ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
            
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="Solana Hackathon 2025"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
                    <textarea 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      placeholder="Description of your event"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Token Name</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      placeholder="Hackathon Participation Token"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Supply</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={tokenSupply}
                      onChange={(e) => setTokenSupply(parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Token Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                      <img src="/api/placeholder/100/100" alt="Token preview" className="mx-auto mb-2" />
                      <button type="button" className="bg-gray-200 px-4 py-2 rounded-md text-sm">
                        Upload Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-8 border-t pt-6">
                <div className="text-sm text-gray-500">
                  <p>This will create compressed tokens on Solana using ZK Compression</p>
                  <p>Gas fees: ~0.000005 SOL</p>
                </div>
                <button 
                  onClick={handleCreateEvent} 
                  className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
                >
                  Create Event & Mint cTokens
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">Manage Events</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img src={event.image} alt={event.name} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{event.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                    
                    <div className="flex justify-between items-center text-sm mb-4">
                      <span className="font-medium">{event.tokenName}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        {event.claimed}/{event.total} claimed
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => showQR(event)}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md flex items-center justify-center"
                      >
                        <QrCode size={16} className="mr-2" />
                        QR Code
                      </button>
                      <button className="flex-1 bg-gray-200 px-4 py-2 rounded-md flex items-center justify-center">
                        <Users size={16} className="mr-2" />
                        Claimers
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      {showQRModal && currentEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">QR Code for {currentEvent.name}</h3>
              <button 
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-md mb-4 flex items-center justify-center">
              <QrCode size={200} />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Link:</span>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://ctoken.pop/claim/abc123</code>
                  <button className="text-gray-500">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                Share this QR code with event attendees. When scanned, they'll be able to claim their cToken proof of participation.
              </p>
              
              <div className="flex justify-between">
                <button className="bg-gray-200 px-4 py-2 rounded-md text-sm flex items-center">
                  <ExternalLink size={14} className="mr-1" />
                  Open Claim Page
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm">
                  Download QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
