import { useRhinestoneWallet } from '@/hooks/useRhinestoneWallet';
import { useMagic } from '@/hooks/MagicProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Loader2, LogOut } from 'lucide-react';
import { useState } from 'react';

export function WalletSidebar() {
  const { magic } = useMagic();
  const {
    accountAddress,
    magicAddress,
    portfolio,
    isConnected,
    isLoading,
    error,
    logout,
    reconnect,
  } = useRhinestoneWallet();

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(label);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleLogin = async () => {
    if (!email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
      setEmailError('Enter a valid email');
      return;
    }

    try {
      setIsLoggingIn(true);
      setEmailError('');
      await magic?.auth.loginWithEmailOTP({ email });
      setEmail('');
      reconnect();
    } catch (e) {
      console.error('Login error:', e);
      setEmailError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading && !isConnected) {
    return (
      <div className="p-6 h-full">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Wallet</h2>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-400" />
            <p className="text-sm text-slate-600">Setting up your global wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-6 h-full">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Wallet</h2>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Login with Magic to get started
          </p>
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                if (emailError) setEmailError('');
                setEmail(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
              className="w-full p-2 border border-slate-300 rounded-md text-sm"
              disabled={isLoggingIn}
            />
            {emailError && (
              <p className="text-xs text-red-500 mt-1">{emailError}</p>
            )}
          </div>
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn || !email}
            className="w-full"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Logging in...
              </>
            ) : (
              'Login with Email'
            )}
          </Button>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">Wallet</h2>

      <div className="space-y-6">
        {/* Connection Status */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-slate-900">
              Connected via Magic
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            Base
          </Badge>
        </div>

        {/* Magic Address */}
        {magicAddress && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Magic Wallet Address</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono bg-slate-100 p-2 rounded border break-all flex-1">
                {magicAddress.slice(0, 6)}...{magicAddress.slice(-4)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(magicAddress, 'magic')}
                className="h-8 w-8 p-0"
              >
                {copiedAddress === 'magic' ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Global Wallet Address */}
        {accountAddress && (
          <div>
            <p className="text-xs text-slate-500 mb-1">
              Global Wallet Address
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono bg-blue-50 p-2 rounded border break-all flex-1">
                {accountAddress.slice(0, 6)}...{accountAddress.slice(-4)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(accountAddress, 'global')}
                className="h-8 w-8 p-0"
              >
                {copiedAddress === 'global' ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Works on all chains</p>
          </div>
        )}

        {/* Portfolio Summary */}
        {portfolio.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2">Portfolio</p>
            <div className="space-y-2">
              {portfolio.map((token, index) => (
                <div key={index} className="bg-slate-100 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      {token.symbol}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-mono font-semibold text-green-700">
                        {token.totalBalance}
                      </span>
                      <p className="text-xs text-slate-500">Available</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-orange-600">Locked:</span>
                      <span className="font-mono">{token.lockedBalance}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {token.chains.length} chain
                    {token.chains.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {portfolio.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">Get Started</p>
            <p className="text-xs text-blue-600">
              Send some tokens to your global wallet address to see your portfolio and test cross-chain transactions.
            </p>
          </div>
        )}

        {/* Logout */}
        <div className="pt-4 border-t">
          <Button
            onClick={logout}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </div>
    </div>
  );
}
