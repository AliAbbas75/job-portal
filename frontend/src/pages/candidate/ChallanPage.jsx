import { Link, useParams } from 'react-router-dom';
import { getChallan } from '../../api/applications';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { ErrorState, LoadingState } from '../../components/common/PageState';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { t, tList } from '../../i18n';
import { paths } from '../../routes/paths';
import { formatCurrency, formatDate } from '../../utils/format';

/**
 * Printable bank challan for the application fee (T-063): three copies on one page, as with paper
 * challans. The candidate pays at the bank; staff confirm payment in the admin area.
 */
export default function ChallanPage() {
  const { applicationId } = useParams();
  const {
    data: challan,
    error,
    reload,
  } = useAsync(() => getChallan(applicationId), [applicationId]);
  useDocumentTitle(t('fee.challanTitle'));

  if (error) {
    return (
      <div className="page">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }
  if (!challan) return <LoadingState />;

  const rows = [
    [t('fee.challanNo'), challan.challanNo],
    [t('fee.applicationId'), challan.applicationId],
    [t('fee.candidate'), challan.candidate.name],
    [t('fee.cnic'), challan.candidate.cnic],
    [t('fee.job'), challan.job.title],
    [t('fee.advertisementNo'), challan.job.advertisementNo],
    [t('fee.bank'), challan.bank.name],
    [t('fee.accountTitle'), challan.bank.accountTitle],
    [t('fee.accountNo'), challan.bank.accountNo],
    [t('fee.dueDate'), formatDate(challan.dueDate)],
  ];

  return (
    <div className="page flex flex-col gap-5 py-8 print:py-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to={paths.application(challan.applicationId)}
          className="inline-flex items-center gap-1 font-medium"
        >
          <Icon name="arrowLeft" size={16} />
          {t('fee.back')}
        </Link>
        <Button onClick={() => window.print()}>{t('fee.print')}</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
        {tList('fee.copies').map((copy) => (
          <section
            key={copy}
            className="relative flex flex-col gap-3 rounded-md border-2 border-dashed border-heritage bg-white p-4"
          >
            <header className="border-b border-heritage pb-2">
              <p className="text-xs font-bold tracking-widest uppercase">{copy}</p>
              <h1 className="text-lg">{t('fee.challanTitle')}</h1>
            </header>
            <dl className="flex flex-col gap-1 text-sm">
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-3 border-b border-surface pb-1"
                >
                  <dt>{label}</dt>
                  <dd className="text-right font-bold">{value || '-'}</dd>
                </div>
              ))}
            </dl>
            <p className="flex justify-between border-t-2 border-heritage pt-2 text-lg font-bold">
              <span>{t('fee.amount')}</span>
              <span>{formatCurrency(challan.amount)}</span>
            </p>
            {challan.status === 'paid' && (
              <span className="absolute top-3 right-3 rotate-12 rounded-sm border-2 border-heritage px-2 text-lg font-extrabold text-heritage">
                {t('fee.paidStamp')}
              </span>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
