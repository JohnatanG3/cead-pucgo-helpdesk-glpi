"use client"

import { useState, useRef, useEffect } from "react"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Code,
  Heading2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Atualize a interface RichTextEditorProps para incluir a propriedade className
export interface RichTextEditorProps {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  disabled?: boolean
  className?: string // Adicione esta linha
}

// No componente RichTextEditor, adicione a propriedade className ao div principal
export function RichTextEditor({
  id,
  name,
  value,
  onChange,
  placeholder = "Digite aqui...",
  minHeight = "150px",
  disabled = false,
  className = "", // Adicione esta linha com valor padrão
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [showLinkPopover, setShowLinkPopover] = useState(false)
  const [isInitialRender, setIsInitialRender] = useState(true)
  const [isEmpty, setIsEmpty] = useState(!value)

  // Sincronizar o conteúdo do editor com o valor externo apenas na primeira renderização
  // ou quando o valor muda externamente de forma significativa
  useEffect(() => {
    if (
      editorRef.current &&
      (isInitialRender || !editorRef.current.innerHTML || editorRef.current.innerHTML === "<br>")
    ) {
      editorRef.current.innerHTML = value
      setIsInitialRender(false)
      setIsEmpty(!value)
    }
  }, [value, isInitialRender])

  // Manipular mudanças no editor
  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      onChange(content)

      // Verificar se o conteúdo está vazio para mostrar o placeholder
      setIsEmpty(!content || content === "<br>" || content === "")
    }
  }

  // Aplicar formatação
  const execCommand = (command: string, value = "") => {
    if (disabled) return
    document.execCommand(command, false, value)
    handleInput()
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  // Inserir link
  const insertLink = () => {
    if (!linkUrl) return

    const text = linkText || linkUrl
    execCommand("insertHTML", `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`)

    setLinkUrl("")
    setLinkText("")
    setShowLinkPopover(false)
  }

  // Quando o editor recebe foco, remover o placeholder
  const handleFocus = () => {
    if (isEmpty && editorRef.current) {
      setIsEmpty(false)
    }
  }

  // Quando o editor perde foco, verificar se está vazio para mostrar o placeholder
  const handleBlur = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      setIsEmpty(!content || content === "<br>" || content === "")
    }
  }

  // Adicione className à div principal
  return (
    <div
      className={cn("border rounded-md overflow-hidden", disabled ? "opacity-70 cursor-not-allowed" : "", className)} // Adicione className aqui
      style={{ minHeight }}
    >
      <div className="rich-text-editor-toolbar">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rich-text-editor-button"
          onClick={() => execCommand("bold")}
          disabled={disabled}
        >
          <Bold size={18} />
          <span className="sr-only">Negrito</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rich-text-editor-button"
          onClick={() => execCommand("italic")}
          disabled={disabled}
        >
          <Italic size={18} />
          <span className="sr-only">Itálico</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rich-text-editor-button"
          onClick={() => execCommand("underline")}
          disabled={disabled}
        >
          <Underline size={18} />
          <span className="sr-only">Sublinhado</span>
        </Button>

        <span className="mx-1 text-muted-foreground">|</span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rich-text-editor-button"
          onClick={() => execCommand("insertUnorderedList")}
          disabled={disabled}
        >
          <List size={18} />
          <span className="sr-only">Lista não ordenada</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rich-text-editor-button"
          onClick={() => execCommand("insertOrderedList")}
          disabled={disabled}
        >
          <ListOrdered size={18} />
          <span className="sr-only">Lista ordenada</span>
        </Button>

        <span className="mx-1 text-muted-foreground">|</span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rich-text-editor-button"
          onClick={() => execCommand("justifyLeft")}
          disabled={disabled}
        >
          <AlignLeft size={18} />
          <span className="sr-only">Alinhar à esquerda</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rich-text-editor-button"
          onClick={() => execCommand("justifyCenter")}
          disabled={disabled}
        >
          <AlignCenter size={18} />
          <span className="sr-only">Centralizar</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rich-text-editor-button"
          onClick={() => execCommand("justifyRight")}
          disabled={disabled}
        >
          <AlignRight size={18} />
          <span className="sr-only">Alinhar à direita</span>
        </Button>

        <span className="mx-1 text-muted-foreground">|</span>

        <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="rich-text-editor-button" disabled={disabled}>
              <Link size={18} />
              <span className="sr-only">Inserir link</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Inserir Link</h4>
                <p className="text-sm text-muted-foreground">Adicione um link ao seu texto.</p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="linkUrl" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="linkUrl"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="col-span-3"
                    placeholder="https://exemplo.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="linkText" className="text-right">
                    Texto
                  </Label>
                  <Input
                    id="linkText"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    className="col-span-3"
                    placeholder="Texto do link (opcional)"
                  />
                </div>
              </div>
              <Button type="button" onClick={insertLink}>
                Inserir Link
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rich-text-editor-button"
          onClick={() => execCommand("formatBlock", "<h2>")}
          disabled={disabled}
        >
          <Heading2 size={18} />
          <span className="sr-only">Título</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rich-text-editor-button"
          onClick={() => execCommand("formatBlock", "<pre>")}
          disabled={disabled}
        >
          <Code size={18} />
          <span className="sr-only">Código</span>
        </Button>
      </div>

      <div className="relative">
        <div
          ref={editorRef}
          className="rich-text-editor-content"
          contentEditable={!disabled}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ minHeight }}
          id={id}
          data-name={name}
        />
        {isEmpty && (
          <div className="absolute top-0 left-0 p-3 pointer-events-none text-muted-foreground">{placeholder}</div>
        )}
      </div>

      <input type="hidden" name={name} value={value} />
    </div>
  )
}
