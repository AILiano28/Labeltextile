import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalList } from "@/components/legal/LegalPage";

// Text approved by the owner. Not published until confirmed by the owner:
// commercial register (RC) and tax (NIF) numbers, data retention periods, the delivery company's name.
export const metadata: Metadata = {
  title: "سياسة الخصوصية | Label Textile",
  description: "كيف تجمع Label Textile معطياتكِ الشخصية وتستعملها، ومع من تشاركها، وما هي حقوقكِ.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="سياسة الخصوصية" updated="2 نوفمبر 2026">
      <p>
        تحترم Label Textile خصوصيتكِ. توضح هذه الصفحة المعطيات التي نجمعها عند استعمالكِ لموقعنا، ولماذا
        نستعملها، ومع من نشاركها، وما هي حقوقكِ.
      </p>

      <LegalSection title="1. من نحن">
        <LegalList
          items={[
            "Label Textile",
            "العنوان: دالي إبراهيم، عين الله، الجزائر",
            "الهاتف (خدمة العملاء): 0776506113",
            "البريد الإلكتروني: Contact@labeltextile.com",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. المعطيات التي نجمعها">
        <p className="font-medium text-black">عند تقديم طلب:</p>
        <LegalList
          items={[
            "الاسم الكامل",
            "رقم الهاتف",
            "الولاية والبلدية",
            "طريقة التوصيل (إلى المنزل أو إلى مكتب شركة التوصيل)",
            "تفاصيل الطلب: المنتج، المقاس، اللون، الكمية، السعر وتكلفة التوصيل",
          ]}
        />
        <p>لا نطلب أي معلومات بطاقة بنكية، لأن الدفع يتم نقدًا عند الاستلام.</p>
        <p>
          <span className="font-medium text-black">عند كتابة تقييم لمنتج:</span> الاسم الذي تكتبينه، والتعليق،
          والتقييم بالنجوم. يظهر التقييم للعموم في صفحة المنتج.
        </p>
        <p>
          <span className="font-medium text-black">عند التواصل معنا</span> عبر الهاتف أو واتساب أو البريد
          الإلكتروني: المعلومات التي تشاركينها معنا، مثل صورة المنتج عند طلب الاستبدال.
        </p>
        <p className="font-medium text-black">
          معطيات تقنية تُجمع تلقائيًا عبر أداة Meta Pixel وواجهة Conversions API الخاصة بشركة Meta:
        </p>
        <LegalList
          items={[
            "عنوان IP",
            "نوع المتصفح والجهاز",
            "معرّفات ملفات تعريف الارتباط (‎_fbp و ‎_fbc)",
            "الصفحات والمنتجات التي تشاهدينها",
            "بدء الطلب وإتمامه",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. لماذا نستعمل معطياتكِ">
        <LegalList
          items={[
            "معالجة طلبكِ وتأكيده معكِ هاتفيًا أو عبر واتساب قبل الشحن",
            "توصيل الطلب وتحصيل المبلغ عند الاستلام",
            "معالجة طلبات الاستبدال والرد على استفساراتكِ",
            "نشر التقييمات التي تكتبينها",
            "قياس فعالية إعلاناتنا على فيسبوك وإنستغرام وتحسين الموقع",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. مع من نشارك معطياتكِ">
        <p>لا نبيع معطياتكِ الشخصية. نشاركها فقط في الحالات التالية:</p>
        <LegalList
          items={[
            <>
              <span className="font-medium text-black">شركة التوصيل:</span> الاسم ورقم الهاتف والولاية والبلدية
              وتفاصيل الطلب والمبلغ المطلوب تحصيله، لغرض التوصيل فقط.
            </>,
            <>
              <span className="font-medium text-black">شركة Meta Platforms (فيسبوك وإنستغرام):</span> المعطيات
              التقنية المذكورة أعلاه. عند إتمام الطلب، نرسل أيضًا رقم الهاتف والاسم والبلدية والولاية بعد تشفيرها
              بطريقة لا تسمح بقراءتها مباشرة (hashing)، لقياس نتائج الإعلانات. تُعالَج هذه المعطيات أيضًا وفق{" "}
              <a
                href="https://www.facebook.com/privacy/policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-primary-900"
              >
                سياسة خصوصية Meta
              </a>
              .
            </>,
            <>
              <span className="font-medium text-black">مزوّدو الخدمات التقنية</span> الذين يستضيفون الموقع وقاعدة
              بيانات الطلبات أو يمرّرون بيانات القياس، في حدود ما يلزم لتقديم الخدمة.
            </>,
            <>
              <span className="font-medium text-black">السلطات المختصة</span> عندما يفرض القانون ذلك.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="5. معالجة المعطيات خارج الجزائر">
        <p>قد تُعالَج بعض المعطيات خارج الجزائر، مثل خوادم شركة Meta وخوادم استضافة الموقع.</p>
      </LegalSection>

      <LegalSection title="6. ملفات تعريف الارتباط (Cookies)">
        <p>
          يستعمل الموقع ملفات تعريف ارتباط خاصة بشركة Meta لقياس الإعلانات. يمكنكِ حذفها أو منعها من إعدادات
          متصفحكِ، كما يمكنكِ التحكم في الإعلانات التي تظهر لكِ من إعدادات الإعلانات في حساب فيسبوك أو إنستغرام.
          لا يؤثر منعها على إمكانية الطلب.
        </p>
      </LegalSection>

      <LegalSection title="7. حقوقكِ">
        <p>
          وفقًا للقانون رقم 18-07 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي،
          يحق لكِ:
        </p>
        <LegalList
          items={[
            "الإعلام بكيفية معالجة معطياتكِ",
            "الولوج إليها",
            "تصحيحها أو تحيينها أو مسحها إذا كانت غير صحيحة أو غير مكتملة",
            "الاعتراض على معالجتها لأسباب مشروعة، وعلى استعمالها لأغراض إشهارية",
          ]}
        />
        <p>
          لممارسة هذه الحقوق، تواصلي معنا عبر البريد الإلكتروني أو الهاتف المذكورَين أدناه. كما يحق لكِ تقديم شكوى
          إلى السلطة الوطنية لحماية المعطيات ذات الطابع الشخصي.
        </p>
      </LegalSection>

      <LegalSection title="8. تعديل هذه السياسة">
        <p>قد نقوم بتحديث هذه السياسة. يُنشر كل تحديث في هذه الصفحة مع تاريخ آخر تحديث.</p>
      </LegalSection>

      <LegalSection title="9. تواصلي معنا">
        <LegalList
          items={[
            "الهاتف (خدمة العملاء): 0776506113",
            "البريد الإلكتروني: Contact@labeltextile.com",
            "العنوان: دالي إبراهيم، عين الله، الجزائر",
          ]}
        />
      </LegalSection>
    </LegalPage>
  );
}
