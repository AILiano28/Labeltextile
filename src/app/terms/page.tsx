import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, LegalList } from "@/components/legal/LegalPage";

// Text approved by the owner. Not published until confirmed by the owner:
// commercial register (RC) and tax (NIF) numbers, who pays delivery for an exchange, refund rules
// for defective or non-conforming items, what happens when a customer cannot be reached.
export const metadata: Metadata = {
  title: "الشروط والأحكام | Label Textile",
  description: "شروط الطلب والدفع عند الاستلام والتوصيل والاستبدال لدى Label Textile.",
};

export default function TermsPage() {
  return (
    <LegalPage title="الشروط والأحكام" updated="2 نوفمبر 2026">
      <p>
        تنظّم هذه الشروط الطلبات عبر موقع labeltextile.com. تقديم طلب عبر الموقع يعني قبولكِ لهذه الشروط.
      </p>

      <LegalSection title="1. التعريف بالبائع">
        <LegalList
          items={[
            "Label Textile",
            "العنوان: دالي إبراهيم، عين الله، الجزائر",
            "الهاتف (خدمة العملاء): 0776506113",
            "واتساب (طلبات الاستبدال): 0654770074",
            "البريد الإلكتروني: Contact@labeltextile.com",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. المنتجات والأسعار">
        <LegalList
          items={[
            "نعرض لكل منتج: الصور، والوصف، والخامة، والمقاسات المتوفرة، ودليل المقاسات، والسعر.",
            "الأسعار بالدينار الجزائري (د.ج).",
            "تكلفة التوصيل تُحسب حسب الولاية وطريقة التوصيل، وتظهر مع المبلغ الإجمالي قبل تأكيد الطلب.",
            "لا توجد رسوم مخفية.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. الطلب">
        <ol className="list-decimal space-y-1.5 pr-5">
          <li>تختارين المنتج والمقاس واللون والكمية، ثم تملئين الاسم ورقم الهاتف والولاية والبلدية وطريقة التوصيل.</li>
          <li>يظهر لكِ سعر المنتج وتكلفة التوصيل والمبلغ الإجمالي قبل الضغط على زر الطلب.</li>
          <li>نتواصل معكِ هاتفيًا أو عبر واتساب لتأكيد الطلب قبل الشحن.</li>
          <li>يتم تجهيز الطلبية في نفس يوم التأكيد.</li>
        </ol>
      </LegalSection>

      <LegalSection title="4. الدفع">
        <p>الدفع نقدًا عند الاستلام فقط. لا نطلب أي دفع مسبق ولا أي معلومات بنكية.</p>
      </LegalSection>

      <LegalSection title="5. التوصيل">
        <LegalList
          items={[
            "نوصّل إلى جميع ولايات الجزائر، إلى المنزل أو إلى مكتب شركة التوصيل حسب ما هو متاح في ولايتكِ.",
            "مدة التوصيل المتوقعة من 1 إلى 3 أيام عمل، حسب الولاية وشركة الشحن.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. المعاينة عند الاستلام">
        <p>
          يمكنكِ فتح الطرد ومعاينة المنتج والتأكد من مطابقته لطلبكِ وسلامته قبل الدفع، وفق شروط شركة التوصيل.
        </p>
      </LegalSection>

      <LegalSection title="7. سياسة الاستبدال">
        <LegalList
          items={[
            "يمكن طلب الاستبدال خلال 24 ساعة من استلام الطلبية.",
            "يجب أن يكون المنتج غير مستعمل، في حالته الأصلية، ومع تغليفه الأصلي.",
          ]}
        />
        <p className="font-medium text-black">الحالات المقبولة:</p>
        <LegalList
          items={[
            "مشكلة في المقاس",
            "استلام منتج مختلف عن المطلوب",
            "وجود عيب مصنعي أو مشكلة في المنتج",
          ]}
        />
        <p className="font-medium text-black">كيفية الطلب:</p>
        <ol className="list-decimal space-y-1.5 pr-5">
          <li>تواصلي معنا خلال 24 ساعة عبر واتساب على الرقم 0654770074.</li>
          <li>أرسلي صورة واضحة للمنتج تُظهر المشكلة إن وُجدت.</li>
          <li>نراجع الطلب ونؤكد الاستبدال.</li>
          <li>نرسل المنتج البديل وفق مدة التوصيل المعتادة.</li>
        </ol>
      </LegalSection>

      <LegalSection title="8. حقوق المستهلك">
        <p>لا تمسّ هذه الشروط بالحقوق التي يكفلها القانون الجزائري للمستهلك.</p>
      </LegalSection>

      <LegalSection title="9. التقييمات">
        <p>
          عند نشر تقييم، تلتزمين بأن يكون صادقًا ولائقًا. يحق لنا حذف أي محتوى مسيء أو مخالف للقانون أو لا علاقة له
          بالمنتج.
        </p>
      </LegalSection>

      <LegalSection title="10. المحتوى">
        <p>لا يجوز نسخ صور الموقع أو نصوصه أو استعمالها لأغراض تجارية دون إذن كتابي منا.</p>
      </LegalSection>

      <LegalSection title="11. المعطيات الشخصية">
        <p>
          نعالج معطياتكِ وفق{" "}
          <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-primary-900">
            سياسة الخصوصية
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="12. القانون المطبق والنزاعات">
        <p>
          تخضع هذه الشروط للقانون الجزائري. نسعى أولًا لحل أي خلاف وديًا عبر التواصل معنا، وفي حال تعذّر ذلك يُعرض
          النزاع على الجهات القضائية الجزائرية المختصة.
        </p>
      </LegalSection>

      <LegalSection title="13. تعديل الشروط">
        <p>قد نقوم بتحديث هذه الشروط. تُطبَّق على كل طلب الشروطُ المنشورة وقت تقديمه.</p>
      </LegalSection>

      <LegalSection title="14. تواصلي معنا">
        <LegalList
          items={[
            "الهاتف (خدمة العملاء): 0776506113",
            "واتساب (طلبات الاستبدال): 0654770074",
            "البريد الإلكتروني: Contact@labeltextile.com",
            "العنوان: دالي إبراهيم، عين الله، الجزائر",
          ]}
        />
      </LegalSection>
    </LegalPage>
  );
}
