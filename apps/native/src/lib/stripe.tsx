import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { trpc } from './trpc';
import { colors } from './theme';

type PlanCheckoutInput = {
  planId: string;
  propertyId: string;
  billingFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
};

type CheckoutResult = { status: 'completed' | 'canceled' };

export function usePlanPaymentSheet() {
  return async (input: PlanCheckoutInput): Promise<CheckoutResult> => {
    const redirect = Linking.createURL('stripe-checkout');
    const { checkoutUrl } = await trpc.subscription.subscribe.mutate({
      ...input,
      successUrl: `${redirect}?status=success`,
      cancelUrl: `${redirect}?status=canceled`,
    });

    if (!checkoutUrl) {
      throw new Error('Unable to start checkout.');
    }

    const result = await WebBrowser.openAuthSessionAsync(
      checkoutUrl,
      redirect,
      {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        toolbarColor: colors.night,
        controlsColor: colors.lime,
        createTask: false,
      },
    );

    if (result.type !== 'success') {
      return { status: 'canceled' };
    }
    if (result.url.includes('status=canceled')) {
      return { status: 'canceled' };
    }
    return { status: 'completed' };
  };
}
