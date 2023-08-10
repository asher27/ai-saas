'use client';

import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import axios from 'axios';
import { useState } from 'react';
import toast from "react-hot-toast";

interface SubscriptionButtonProps {
  isPro: boolean;
}

const SubscriptionButton = ({ isPro }: SubscriptionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/stripe`);
      window.location.href = response.data.url;
    } catch (e) {
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button disabled={isLoading} onClick={onClick} variant={isPro ? 'default' : 'premium'}>
      {isPro ? 'Manage Subscription' : 'Upgrade'}
      {!isPro && <Zap className={'h-4 w-4 ml-2 fill-white'} />}
    </Button>
  );
};

export default SubscriptionButton;
