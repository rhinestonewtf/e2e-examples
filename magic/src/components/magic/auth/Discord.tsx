import { LoginProps } from '@/utils/types';
import { useMagic } from '@/hooks/MagicProvider';
import { useEffect, useState } from 'react';
import { saveUserInfo } from '@/utils/common';
import Spinner from '@/components/ui/Spinner';
import Image from 'next/image';
import discord from 'public/social/Discord.svg';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';

const Discord = ({ token, setToken }: LoginProps) => {
  const { magic } = useMagic();
  const [isAuthLoading, setIsAuthLoading] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthLoading(localStorage.getItem('isAuthLoading'));
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        if (magic) {
          const result = await magic?.oauth.getRedirectResult();
          const metadata = await magic?.user.getInfo();
          if (!metadata?.publicAddress) return;
          setToken(result.magic.idToken);
          saveUserInfo(result.magic.idToken, 'SOCIAL', metadata?.publicAddress);
          setLoadingFlag('false');
        }
      } catch (e) {
        console.log('social login error: ' + e);
        setLoadingFlag('false');
      }
    };

    checkLogin();
  }, [magic, setToken]);

  const login = async () => {
    setLoadingFlag('true');
    await magic?.oauth.loginWithRedirect({
      provider: 'discord',
      redirectURI: window.location.origin,
    });
  };

  const setLoadingFlag = (loading: string) => {
    localStorage.setItem('isAuthLoading', loading);
    setIsAuthLoading(loading);
  };

  return (
    <Card>
      <CardHeader id="discord">Discord Login</CardHeader>
      {isAuthLoading && isAuthLoading !== 'false' ? (
        <Spinner />
      ) : (
        <div className="login-method-grid-item-container">
          <button
            className="social-login-button"
            onClick={() => {
              if (token.length == 0) login();
            }}
            disabled={false}
          >
            <Image src={discord} alt="Discord" height={24} width={24} className="mr-6" />
            <div className="w-full text-xs font-semibold text-center">Continue with Discord</div>
          </button>
        </div>
      )}
    </Card>
  );
};
export default Discord;
