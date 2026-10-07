"use client";

import { Field } from "@/components/admin/Field";
import { SaveBar } from "@/components/admin/SaveBar";
import { FormSection } from "@/components/admin/FormSection";
import { FactsEditor } from "@/components/admin/FactsEditor";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { Input, Textarea } from "@/components/ui/Input";
import { useSectionForm } from "@/components/admin/section-forms/use-section-form";
import type { AboutPageContent } from "@/types/content";

/** Replace one item of an array field by index. */
function patchAt<T>(items: T[], index: number, patch: Partial<T>): T[] {
  const next = [...items];
  next[index] = { ...next[index], ...patch };
  return next;
}

export function AboutPageForm({ id, content }: { id: string; content: AboutPageContent }) {
  const { state, update, saveBarProps } = useSectionForm(id, content);

  return (
    <div className="flex flex-col gap-6">
      <FormSection title="1. Top of the page" description="The big photo, headline and intro visitors see first.">
        <Field label="Badge" hint="Small pill above the headline.">
          <Input value={state.heroBadge} onChange={(e) => update("heroBadge", e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Headline (white part)" hint='e.g. "Meet"'>
            <Input value={state.headingLead} onChange={(e) => update("headingLead", e.target.value)} />
          </Field>
          <Field label="Headline (blue part)" hint='e.g. "Michael."'>
            <Input value={state.headingAccent} onChange={(e) => update("headingAccent", e.target.value)} />
          </Field>
        </div>
        <Field label="Intro">
          <Textarea value={state.heroIntro} onChange={(e) => update("heroIntro", e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Photo" hint="Large portrait. Use a high-resolution image.">
            <MediaUploadField value={state.heroImage} onChange={(url) => update("heroImage", url)} />
          </Field>
          <Field label="Photo alt text">
            <Input value={state.heroImageAlt} onChange={(e) => update("heroImageAlt", e.target.value)} />
          </Field>
        </div>
        <Field label="Fact strip">
          <FactsEditor facts={state.heroFacts} onChange={(next) => update("heroFacts", next)} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Button label">
            <Input
              value={state.heroCta.label}
              onChange={(e) => update("heroCta", { ...state.heroCta, label: e.target.value })}
            />
          </Field>
          <Field label="Button goes to" hint="e.g. /contact">
            <Input
              value={state.heroCta.href}
              onChange={(e) => update("heroCta", { ...state.heroCta, href: e.target.value })}
            />
          </Field>
        </div>
        <p className="text-xs text-foreground-subtle">
          The phone button next to it uses the phone number from Settings.
        </p>
      </FormSection>

      <FormSection
        title="2. Big statement"
        description="The sentence that lights up word by word as visitors scroll."
      >
        <Field label="Statement" hint="Wrap words in *asterisks* to make them blue, e.g. *systems*">
          <Textarea value={state.statement} onChange={(e) => update("statement", e.target.value)} />
        </Field>
      </FormSection>

      <FormSection title="3. Story" description="The photo that stays pinned while the numbered chapters scroll by.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Photo">
            <MediaUploadField value={state.storyImage} onChange={(url) => update("storyImage", url)} />
          </Field>
          <Field label="Photo alt text">
            <Input value={state.storyImageAlt} onChange={(e) => update("storyImageAlt", e.target.value)} />
          </Field>
        </div>
        <Field label="Caption on the photo">
          <Input value={state.storyCaption} onChange={(e) => update("storyCaption", e.target.value)} />
        </Field>
        <Field label="Chapters">
          <RepeatableList
            items={state.chapters}
            onChange={(next) => update("chapters", next)}
            createItem={() => ({ id: crypto.randomUUID(), tag: "", title: "", body: "" })}
            addLabel="+ Add chapter"
            renderItem={(chapter, index) => (
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Small label, e.g. The builder"
                  value={chapter.tag}
                  onChange={(e) => update("chapters", patchAt(state.chapters, index, { tag: e.target.value }))}
                />
                <Input
                  placeholder="Title"
                  value={chapter.title}
                  onChange={(e) => update("chapters", patchAt(state.chapters, index, { title: e.target.value }))}
                />
                <Textarea
                  placeholder="Story"
                  value={chapter.body}
                  onChange={(e) => update("chapters", patchAt(state.chapters, index, { body: e.target.value }))}
                />
              </div>
            )}
          />
        </Field>
      </FormSection>

      <FormSection title="4. Playbook" description="The numbered cards (01, 02, 03…) on the glowing background.">
        <Field label="Eyebrow">
          <Input value={state.playbookEyebrow} onChange={(e) => update("playbookEyebrow", e.target.value)} />
        </Field>
        <Field label="Heading">
          <Input value={state.playbookHeading} onChange={(e) => update("playbookHeading", e.target.value)} />
        </Field>
        <Field label="Intro">
          <Textarea value={state.playbookIntro} onChange={(e) => update("playbookIntro", e.target.value)} />
        </Field>
        <Field label="Cards" hint="Numbers are added automatically in this order.">
          <RepeatableList
            items={state.playbook}
            onChange={(next) => update("playbook", next)}
            createItem={() => ({ id: crypto.randomUUID(), title: "", description: "" })}
            addLabel="+ Add card"
            renderItem={(item, index) => (
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => update("playbook", patchAt(state.playbook, index, { title: e.target.value }))}
                />
                <Textarea
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    update("playbook", patchAt(state.playbook, index, { description: e.target.value }))
                  }
                />
              </div>
            )}
          />
        </Field>
      </FormSection>

      <FormSection title="5. Questions owners ask" description="The question-and-answer grid.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_120px]">
          <Field label="Eyebrow">
            <Input value={state.qaEyebrow} onChange={(e) => update("qaEyebrow", e.target.value)} />
          </Field>
          <Field label="Heading">
            <Input value={state.qaHeading} onChange={(e) => update("qaHeading", e.target.value)} />
          </Field>
          <Field label="Initials" hint="Next to answers">
            <Input value={state.qaInitials} onChange={(e) => update("qaInitials", e.target.value)} />
          </Field>
        </div>
        <Field label="Questions">
          <RepeatableList
            items={state.qa}
            onChange={(next) => update("qa", next)}
            createItem={() => ({ id: crypto.randomUUID(), question: "", answer: "" })}
            addLabel="+ Add question"
            renderItem={(item, index) => (
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Question"
                  value={item.question}
                  onChange={(e) => update("qa", patchAt(state.qa, index, { question: e.target.value }))}
                />
                <Textarea
                  placeholder="Answer"
                  value={item.answer}
                  onChange={(e) => update("qa", patchAt(state.qa, index, { answer: e.target.value }))}
                />
              </div>
            )}
          />
        </Field>
      </FormSection>

      <FormSection title="6. Closing call to action" description="The last block, over a dark background photo.">
        <Field label="Eyebrow">
          <Input value={state.ctaEyebrow} onChange={(e) => update("ctaEyebrow", e.target.value)} />
        </Field>
        <Field label="Heading">
          <Input value={state.ctaHeading} onChange={(e) => update("ctaHeading", e.target.value)} />
        </Field>
        <Field label="Text">
          <Textarea value={state.ctaBody} onChange={(e) => update("ctaBody", e.target.value)} />
        </Field>
        <Field label="Background photo" hint="Shown dimmed behind the text. Leave empty for a plain background.">
          <MediaUploadField value={state.ctaImage} onChange={(url) => update("ctaImage", url)} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Button label">
            <Input
              value={state.ctaButton.label}
              onChange={(e) => update("ctaButton", { ...state.ctaButton, label: e.target.value })}
            />
          </Field>
          <Field label="Button goes to">
            <Input
              value={state.ctaButton.href}
              onChange={(e) => update("ctaButton", { ...state.ctaButton, href: e.target.value })}
            />
          </Field>
          <Field label="Phone button word" hint='e.g. "Call"'>
            <Input value={state.ctaPhoneLabel} onChange={(e) => update("ctaPhoneLabel", e.target.value)} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Search & sharing for /about" description="What Google and link previews show for this page.">
        <Field label="Page title" hint={`${state.seoTitle.length} characters. Aim for under 60.`}>
          <Input value={state.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} />
        </Field>
        <Field label="Page description" hint={`${state.seoDescription.length} characters. Aim for 120 to 160.`}>
          <Textarea value={state.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} />
        </Field>
      </FormSection>

      <SaveBar {...saveBarProps} />
    </div>
  );
}
