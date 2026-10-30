# Graph Report - Fermi-PWA  (2026-10-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 3732 nodes · 7801 edges · 198 communities (95 shown, 103 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 149 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `65637909`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- pdf.worker.min.mjs
- XFAObjectArray
- StringObject
- getStringOption
- OptionObject
- getInteger
- TemplateNamespace
- Word64
- XFAObject
- Option01
- shadow
- memberAdmin.ts
- ConfigNamespace
- ContentObject
- Jbig2Error
- XhtmlObject
- Dict
- users.ts
- next
- AppDataProvider.tsx
- getMeasurement
- RefSetCache
- steps
- Font
- PDFDocument
- WidgetAnnotation
- LocaleSetNamespace
- ._create
- Text
- firebase.ts
- Page
- ExpressionBuilderVisitor
- ConnectionSetNamespace
- .checkAndRepair
- compileCharString
- .getOperatorList
- IntegerObject
- Annotation
- Glyph
- XRef
- email-admin/page.tsx
- useFermiSession
- profiel/page.tsx
- warn
- package.json
- ChunkedStreamManager
- .success
- activiteiten-admin/page.tsx
- ColorSpace
- Util
- .makeFilter
- bytesToString
- PDFImage
- unreachable
- agenda/page.tsx
- ExclGroup
- FermiPdfViewer.tsx
- Parser
- generate-agenda-image-manifest.mjs
- ot
- Binder
- react
- RefSet
- .[jr]
- BasePdfManager
- Builder
- OperatorList
- CFFCompiler
- CFFParser
- parseCMap
- Lexer
- Type1Parser
- .createDocumentHandler
- PartialEvaluator
- .constructPostScript
- compilerOptions
- TextMeasure
- Stream
- XmlObject
- .loadFont
- PDFWorkerStreamReader
- qr-scanner/page.tsx
- ButtonWidgetAnnotation
- Area
- XFAFactory
- JpegStream
- .getTextContent
- .parse
- CalRGBCS
- ChunkedStream
- CMap
- SimpleXMLParser
- Type1Font
- CFFDict
- DecodeStream
- IdentityCMap
- FormatError
- .extractDataStructures
- StructTreePage
- XMLParserBase
- Commands
- NullOptimizer
- .a
- info
- JpegImage
- SimpleDOMNode
- ImageResizer
- JpxStream
- .parseShading
- XFAParser
- CFFStrings
- Datasets
- Value
- LabCS
- StampAnnotation
- MessageHandler
- TranslatedFont
- PostScriptStack
- XFAAttribute
- BinaryCMapStream
- mapStyle
- FontFinder
- getFontSubstitution
- Option10
- .setBorderStyle
- FlateStream
- MeshStreamReader
- PostScriptParser
- TextState
- scripts
- Jbig2Stream
- MetadataParser
- StructElementNode
- sw.js
- CalGrayCS
- CFFIndex
- CFFOffsetTracker
- DeviceCmykCS
- DeviceRgbCS
- HTMLResult
- IndexedCS
- PageSet
- Template
- xdp_Xdp
- .[jr]
- Border
- DeviceGrayCS
- DeviceRgbaCS
- PostScriptLexer
- signature_Signature
- Stylesheet
- Traverse
- Ui
- Assist
- EquateRange
- PageRange
- Relevant
- Fill
- ImageEdit
- Linear
- Overflow
- StreamsSequenceStream
- template_Pattern
- Variables
- community-members.ts
- AutoSave
- CFFFDSelect
- Compression
- config_Encryption
- config_Message
- config_Script
- config_Validate
- Debug
- Destination
- DuplexOption
- EncryptionLevel
- IncrementalLoad
- MediumInfo
- Output
- Overprint
- PaginationOverride
- Permissions
- PrintScaling
- RenderPolicy
- RunScripts
- SilentPrint
- ValidationMessaging
- ViewerPreferences
- Whitespace
- Xsl
- DigestMethods
- Encryption
- EncryptionMethods
- ExObject
- KeyUsage
- PasswordEdit
- Rectangle

## God Nodes (most connected - your core abstractions)
1. `XFAObject` - 217 edges
2. `warn()` - 163 edges
3. `ConfigNamespace` - 141 edges
4. `TemplateNamespace` - 115 edges
5. `shadow()` - 93 edges
6. `FormatError` - 88 edges
7. `getStringOption()` - 85 edges
8. `XFAObjectArray` - 66 edges
9. `StringObject` - 49 edges
10. `PartialEvaluator` - 47 edges

## Surprising Connections (you probably didn't know these)
- `LedenAdminPage()` --calls--> `getUserProfile()`  [EXTRACTED]
  app/profiel/leden-admin/page.tsx → lib/services/users.ts
- `create()` --calls--> `registerWithAlternativeEmail()`  [EXTRACTED]
  app/register/ander-email/page.tsx → lib/services/auth.ts
- `create()` --calls--> `registerWithEmail()`  [EXTRACTED]
  app/register/page.tsx → lib/services/auth.ts
- `RootLayout()` --calls--> `AuthGuard()`  [EXTRACTED]
  app/layout.tsx → components/AuthGuard.tsx
- `BoardPage()` --calls--> `useAssociationContent()`  [EXTRACTED]
  app/fermi/bestuur/page.tsx → lib/services/association.ts

## Import Cycles
- None detected.

## Communities (198 total, 103 thin omitted)

### Community 0 - "pdf.worker.min.mjs"
Cohesion: 0.01
Nodes (154): Aa, addHex(), ai, Ar, As, ba, Bi, bidi() (+146 more)

### Community 1 - "XFAObjectArray"
Cohesion: 0.02
Nodes (26): Acrobat, Agent, CalendarSymbols, Common, config_FontInfo, ConnectionSet, CurrencySymbols, DatePatterns (+18 more)

### Community 2 - "StringObject"
Cohesion: 0.03
Nodes (26): Amd, Base, Certificate, config_Picture, Creator, Enforce, ExcludeNS, GroupParent (+18 more)

### Community 3 - "getStringOption"
Cohesion: 0.03
Nodes (24): AppearanceFilter, BatchOutput, Bind, Button, Calculate, Compress, DateTimeEdit, Encodings (+16 more)

### Community 4 - "OptionObject"
Cohesion: 0.03
Nodes (23): ADBE_JSConsole, ADBE_JSDebugger, Attributes, Conformance, DigestMethod, DynamicRender, Encoding, EncryptionMethod (+15 more)

### Community 5 - "getInteger"
Cohesion: 0.03
Nodes (21): Arc, Break, BreakAfter, BreakBefore, Comb, config_Area, DayNames, Equate (+13 more)

### Community 6 - "TemplateNamespace"
Cohesion: 0.03
Nodes (20): Barcode, BindItems, Bookend, Certificates, Connect, DefaultUi, Desc, Encrypt (+12 more)

### Community 7 - "Word64"
Cohesion: 0.05
Nodes (14): AES128Cipher, AES256Cipher, AESBaseCipher, Ag, ARCFourCipher, CipherTransform, CipherTransformFactory, eg (+6 more)

### Community 8 - "XFAObject"
Cohesion: 0.03
Nodes (5): Config, Data, LabelPrinter, NumberPatterns, XFAObject

### Community 9 - "Option01"
Cohesion: 0.03
Nodes (20): AddSilentPrint, AddViewerPreferences, Change, CompressLogicalStructure, config_Encrypt, ContentCopy, DocumentAssembly, Embed (+12 more)

### Community 10 - "shadow"
Cohesion: 0.07
Nodes (6): Catalog, FeatureTest, fetchDest(), NameTree, PostScriptToken, shadow()

### Community 11 - "memberAdmin.ts"
Cohesion: 0.09
Nodes (47): accessLabels, associationLabels, LedenAdminPage(), addMember(), changePayment(), closeMember(), importCsv(), refresh() (+39 more)

### Community 12 - "ConfigNamespace"
Cohesion: 0.04
Nodes (16): Acrobat7, Cache, config_Template, ConfigNamespace, Driver, Log, OpenAction, OutputXSL (+8 more)

### Community 13 - "ContentObject"
Cohesion: 0.04
Nodes (13): AlwaysEmbed, BehaviorOverride, ContentObject, DefaultTypeface, Exclude, ExData, NeverEmbed, Range (+5 more)

### Community 14 - "Jbig2Error"
Cohesion: 0.08
Nodes (19): ArithmeticDecoder, ContextCache, decodeBitmap(), decodeIAID(), decodeInteger(), decodeMMRBitmap(), decodeRefinement(), decodeTextRegion() (+11 more)

### Community 15 - "XhtmlObject"
Cohesion: 0.05
Nodes (14): B, Body, br, Html, i, li, Ol, P (+6 more)

### Community 16 - "Dict"
Cohesion: 0.08
Nodes (10): codePointIter(), Dict, FakeUnicodeFont, FreeTextAnnotation, getPdfColor(), InkAnnotation, Name, numberToString() (+2 more)

### Community 17 - "users.ts"
Cohesion: 0.08
Nodes (31): AlternativeEmailLoginPage(), submit(), LoginPage(), finishLogin(), submit(), AlternativeRegisterPage(), create(), Data (+23 more)

### Community 18 - "next"
Cohesion: 0.10
Nodes (29): BoardPage(), CommitteePage(), BarChartIcon(), board, documents, FERMI_VISUAL_ASSETS, FermiPage(), VerenigingAdminPage() (+21 more)

### Community 19 - "AppDataProvider.tsx"
Cohesion: 0.10
Nodes (36): emptyForm, formFromAnnouncement(), FormState, iconFor(), MededelingenAdminPage(), handleSave(), openEdit(), refresh() (+28 more)

### Community 20 - "getMeasurement"
Cohesion: 0.05
Nodes (12): Caption, ContentArea, Draw, Field, getMeasurement(), getRelevant(), jn, Margin (+4 more)

### Community 21 - "RefSetCache"
Cohesion: 0.09
Nodes (4): GlobalImageCache, isDict(), RefSetCache, StructTreeRoot

### Community 22 - "steps"
Cohesion: 0.05
Nodes (39): env, runs-on, steps, concurrency, cancel-in-progress, group, environment, needs (+31 more)

### Community 23 - "Font"
Cohesion: 0.06
Nodes (15): adjustWidths(), amendFallbackToUnicode(), applyStandardFontGlyphMap(), buildToFontChar(), CFFFont, convertCidString(), Font, fonts_Glyph (+7 more)

### Community 24 - "PDFDocument"
Cohesion: 0.07
Nodes (7): addPageError(), clearGlobalCaches(), find(), isName(), PDFDocument, toHexUtil(), XRefParseException

### Community 25 - "WidgetAnnotation"
Cohesion: 0.10
Nodes (8): ChoiceWidgetAnnotation, DefaultAppearanceEvaluator, escapeString(), getInheritableProperty(), parseDefaultAppearance(), SignatureWidgetAnnotation, TextWidgetAnnotation, WidgetAnnotation

### Community 26 - "LocaleSetNamespace"
Cohesion: 0.05
Nodes (13): CurrencySymbol, DatePattern, DateTimeSymbols, Day, Era, locale_set_Locale, LocaleSetNamespace, Meridiem (+5 more)

### Community 27 - "._create"
Cohesion: 0.11
Nodes (18): CaretAnnotation, CircleAnnotation, FileAttachmentAnnotation, getPdfColorArray(), getQuadPoints(), getRgbColor(), HighlightAnnotation, LineAnnotation (+10 more)

### Community 28 - "Text"
Cohesion: 0.05
Nodes (8): BooleanElement, DateElement, DateTime, Decimal, Float, Integer, Text, valueToHtml()

### Community 29 - "firebase.ts"
Cohesion: 0.13
Nodes (26): Notice, EventActions(), toggleRegistration(), PendingDialogDetail, showMembershipPendingDialog(), membershipFromUser(), privilegedMembership(), SessionContext (+18 more)

### Community 30 - "Page"
Cohesion: 0.08
Nodes (3): AnnotationFactory, isRefsEqual(), Page

### Community 31 - "ExpressionBuilderVisitor"
Cohesion: 0.08
Nodes (12): AstArgument, AstBinaryOperation, AstLiteral, AstMin, AstNode, AstVariable, AstVariableDefinition, buildAddOperation() (+4 more)

### Community 32 - "ConnectionSetNamespace"
Cohesion: 0.06
Nodes (12): connection_set_Uri, ConnectionSetNamespace, EffectiveInputPolicy, EffectiveOutputPolicy, Operation, RootElement, SoapAction, SoapAddress (+4 more)

### Community 33 - ".checkAndRepair"
Cohesion: 0.09
Nodes (24): adjustMapping(), createCmapTable(), createNameTable(), createOS2Table(), createPostscriptName(), createPostTable(), readNameTable(), readTableEntry() (+16 more)

### Community 34 - "compileCharString"
Cohesion: 0.08
Nodes (15): compileCharString(), CompiledFont, compileGlyf(), FontRendererFactory, getFloat214(), getInt16(), getInt8(), getSubroutineBias() (+7 more)

### Community 35 - ".getOperatorList"
Cohesion: 0.08
Nodes (10): addLocallyCachedImageOps(), AppearanceStreamEvaluator, BaseLocalCache, EvalState, LocalColorSpaceCache, LocalFunctionCache, LocalGStateCache, LocalImageCache (+2 more)

### Community 36 - "IntegerObject"
Cohesion: 0.06
Nodes (10): AdobeExtensionLevel, Copies, CurrentPage, IntegerObject, Level, MsgId, NumberOfCopies, Part (+2 more)

### Community 38 - "Glyph"
Cohesion: 0.07
Nodes (6): CompositeGlyph, Contour, GlyfTable, Glyph, GlyphHeader, SimpleGlyph

### Community 39 - "XRef"
Cohesion: 0.09
Nodes (4): InvalidPDFException, Ref, XRef, XRefEntryException

### Community 40 - "email-admin/page.tsx"
Cohesion: 0.11
Nodes (23): ActivityPage(), AdminOverviewPage(), modules, EmailAdminPage(), EMAILJS, MONTH_NAMES, templates, ActivityRouteClient() (+15 more)

### Community 41 - "useFermiSession"
Cohesion: 0.11
Nodes (25): albumFilters, PhotoAlbumsPage(), CommunityPage(), filters, memberBadge(), memberCategories(), memberSubtitle(), eventEnd() (+17 more)

### Community 42 - "profiel/page.tsx"
Cohesion: 0.11
Nodes (21): FermiMark(), menuItems, ProfilePage(), clampCropOffset(), closePhotoCropper(), cropBounds(), handleCropPointerMove(), handleCropZoom() (+13 more)

### Community 43 - "warn"
Cohesion: 0.12
Nodes (13): appendIfJavaScriptDict(), parseNestedOrder(), parseOrder(), createValidAbsoluteUrl(), decodeString(), fetchRemoteDest(), FileSpec, isValidExplicitDest() (+5 more)

### Community 44 - "package.json"
Cohesion: 0.10
Nodes (27): dependencies, firebase@^12.4.0, html5-qrcode@^2.3.8, lucide-react@^0.468.0, next@15.1.3, pdfjs-dist@^4.10.38, qrcode.react@^4.2.0, react@19.0.0 (+19 more)

### Community 45 - "ChunkedStreamManager"
Cohesion: 0.13
Nodes (3): arrayBuffersToBytes(), ChunkedStreamManager, NetworkPdfManager

### Community 46 - ".success"
Cohesion: 0.17
Nodes (10): ariaLabel(), CheckButton, ChoiceList, Corner, Edge, hasMargin(), isRequired(), measureToString() (+2 more)

### Community 47 - "activiteiten-admin/page.tsx"
Cohesion: 0.14
Nodes (21): ActiviteitenAdminPage(), handleSave(), openEdit(), refresh(), toggleVisibility(), activityFromForm(), activityTypes, capacityPresets (+13 more)

### Community 48 - "ColorSpace"
Cohesion: 0.12
Nodes (3): AlternateCS, ColorSpace, PatternCS

### Community 49 - "Util"
Cohesion: 0.11
Nodes (6): Color, getTransformMatrix(), isNumberArray(), lookupNormalRect(), lookupRect(), Util

### Community 50 - ".makeFilter"
Cohesion: 0.10
Nodes (7): Ascii85Stream, AsciiHexStream, CCITTFaxStream, LZWStream, NullStream, PredictorStream, RunLengthStream

### Community 51 - "bytesToString"
Cohesion: 0.12
Nodes (23): bytesToString(), computeIDs(), escapePDFName(), getFontFileType(), getIndexes(), getSizeInBytes(), incrementalUpdate(), isTrueTypeCollectionFile() (+15 more)

### Community 52 - "PDFImage"
Cohesion: 0.15
Nodes (7): assert(), convertBlackAndWhiteToRGBA(), convertToRGBA(), decodeAndClamp(), PDFImage, resizeImageMask(), toRomanNumerals()

### Community 54 - "agenda/page.tsx"
Cohesion: 0.15
Nodes (20): addMonths(), agendaBackgroundPresets, agendaCardStyle, AgendaFilter, AgendaPage(), changeCalendarPair(), handleCalendarTouchEnd(), renderCalendarMonth() (+12 more)

### Community 55 - "ExclGroup"
Cohesion: 0.10
Nodes (6): addHTML(), createLine(), ExclGroup, flushHTML(), getAvailableSpace(), Subform

### Community 56 - "FermiPdfViewer.tsx"
Cohesion: 0.14
Nodes (14): BeleidsplanPage(), FERMI_BELEIDSPLAN_TOC, FermiPdfViewer(), handleTouchMove(), handleTouchStart(), loadPdf(), touchDistance(), flattenOutline() (+6 more)

### Community 57 - "Parser"
Cohesion: 0.20
Nodes (3): EvaluatorPreprocessor, isWhiteSpace(), Parser

### Community 58 - "generate-agenda-image-manifest.mjs"
Cohesion: 0.11
Nodes (16): activitiesDir, allowed, buildImages(), containerDir, detailDir, featuredDir, labelFromFile(), outputFile (+8 more)

### Community 59 - "ot"
Cohesion: 0.12
Nodes (10): AbortException, DNLMarkerError, EOIMarkerError, MissingPDFException, ot, ParserEOFException, PasswordException, UnexpectedResponseException (+2 more)

### Community 60 - "Binder"
Cohesion: 0.21
Nodes (5): Binder, createDataNode(), createText(), parseExpression(), searchNode()

### Community 61 - "react"
Cohesion: 0.16
Nodes (12): metadata, RootLayout(), viewport, SettingsPage(), GuidedAppTour(), normalizeTourPath(), restartFermiTour(), steps (+4 more)

### Community 62 - "RefSet"
Cohesion: 0.13
Nodes (6): addChildren(), collectActions(), _collectJS(), ObjectLoader, objectSize(), RefSet

### Community 63 - ".[jr]"
Cohesion: 0.26
Nodes (15): applyAssist(), checkDimensions(), computeBbox(), createWrapper(), fixDimensions(), getBorderDims(), handleBreak(), handleOverflow() (+7 more)

### Community 65 - "Builder"
Cohesion: 0.14
Nodes (4): Builder, Empty, Root, UnknownNamespace

### Community 66 - "OperatorList"
Cohesion: 0.16
Nodes (3): getTilingPatternIR(), lookupMatrix(), OperatorList

### Community 68 - "CFFParser"
Cohesion: 0.20
Nodes (3): CFFEncoding, CFFParser, parseOperand()

### Community 69 - "parseCMap"
Cohesion: 0.20
Nodes (15): CMapFactory, createBuiltInCMap(), expectInt(), expectString(), extendCMap(), isCmd(), parseBfChar(), parseBfRange() (+7 more)

### Community 70 - "Lexer"
Cohesion: 0.20
Nodes (4): Cmd, Lexer, Linearization, toHexDigit()

### Community 71 - "Type1Parser"
Cohesion: 0.22
Nodes (5): decrypt(), isHexDigit(), isSpecial(), Type1CharString, Type1Parser

### Community 72 - ".createDocumentHandler"
Cohesion: 0.19
Nodes (11): getNewAnnotationsMap(), getVerbosityLevel(), ensureNotTerminated(), finishWorkerTask(), loadDocument(), setupDoc(), onFailure(), onSuccess() (+3 more)

### Community 73 - "PartialEvaluator"
Cohesion: 0.19
Nodes (5): getXfaFontDict(), getXfaFontName(), is, PartialEvaluator, vi

### Community 74 - ".constructPostScript"
Cohesion: 0.19
Nodes (4): PDFFunction, PDFFunctionFactory, PostScriptCompiler, toNumberArray()

### Community 75 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 76 - "TextMeasure"
Cohesion: 0.15
Nodes (5): FontInfo, FontSelector, layoutNode(), layoutText(), TextMeasure

### Community 79 - ".loadFont"
Cohesion: 0.13
Nodes (4): ErrorFont, isPDFFunction(), MurmurHash3_64, normalizeBlendMode()

### Community 80 - "PDFWorkerStreamReader"
Cohesion: 0.12
Nodes (3): PDFWorkerStream, PDFWorkerStreamRangeReader, PDFWorkerStreamReader

### Community 81 - "qr-scanner/page.tsx"
Cohesion: 0.22
Nodes (13): allowedRoles, eventDate(), QrScannerPage(), handleDecoded(), nextScan(), startScanner(), stopScanner(), resultCopy() (+5 more)

### Community 83 - "Area"
Cohesion: 0.12
Nodes (3): Area, getContainedChildren(), SubformSet

### Community 86 - ".getTextContent"
Cohesion: 0.30
Nodes (13): addFakeSpaces(), appendEOL(), applyInverseRotation(), buildTextContentItem(), compareWithLastPosition(), ensureTextContentItem(), flushTextContentItem(), getCurrentTextTransform() (+5 more)

### Community 87 - ".parse"
Cohesion: 0.28
Nodes (12): buildHuffmanTable(), decodeScan(), decodeHuffman(), readBit(), receive(), receiveAndExtend(), findNextFileMarker(), JpegError (+4 more)

### Community 91 - "SimpleXMLParser"
Cohesion: 0.15
Nodes (5): DatasetReader, DatasetXMLParser, parseXFAPath(), SimpleXMLParser, updateXFA()

### Community 92 - "Type1Font"
Cohesion: 0.19
Nodes (4): CFFCharset, CFFHeader, findBlock(), Type1Font

### Community 93 - "CFFDict"
Cohesion: 0.16
Nodes (3): CFFDict, CFFPrivateDict, CFFTopDict

### Community 96 - "FormatError"
Cohesion: 0.26
Nodes (3): FormatError, getB(), MeshShading

### Community 98 - "StructTreePage"
Cohesion: 0.19
Nodes (3): NameOrNumberTree, NumberTree, StructTreePage

### Community 102 - ".a"
Cohesion: 0.18
Nodes (10): buildComponentData(), readBits(), decodeBlock(), decodeMcu(), getBlockBufferOffset(), handleSetFont(), quantizeAndInverse(), run() (+2 more)

### Community 107 - "JpxStream"
Cohesion: 0.22
Nodes (3): JpxError, JpxImage, JpxStream

### Community 108 - ".parseShading"
Cohesion: 0.22
Nodes (4): BaseShading, DummyShading, Pattern, RadialAxialShading

### Community 111 - "Datasets"
Cohesion: 0.20
Nodes (3): Datasets, datasets_Data, DatasetsNamespace

### Community 114 - "StampAnnotation"
Cohesion: 0.24
Nodes (3): StampAnnotation, stringToAsciiOrUTF16BE(), stringToUTF16String()

### Community 120 - "mapStyle"
Cohesion: 0.22
Nodes (6): fixTextIndent(), getCurrentPara(), mapStyle(), selectFont(), setFontFamily(), setPara()

### Community 122 - "getFontSubstitution"
Cohesion: 0.22
Nodes (9): generateFont(), getFamilyName(), getFontSubstitution(), getStandardFontName(), isKnownFontName(), normalizeFontName(), Ti, validateCSSFont() (+1 more)

### Community 123 - "Option10"
Cohesion: 0.25
Nodes (3): AdjustData, CompressObjectStream, Option10

### Community 129 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, prebuild, predev, start

### Community 133 - "sw.js"
Cohesion: 0.33
Nodes (3): BASE, CORE, FERMI_HEADER_REMOTE

### Community 144 - ".[jr]"
Cohesion: 0.40
Nodes (3): a, fixURL(), recoverJsURL()

## Knowledge Gaps
- **103 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BasePdfManager` connect `BasePdfManager` to `pdf.worker.min.mjs`, `warn`, `Stream`, `ChunkedStreamManager`, `users.ts`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Should `pdf.worker.min.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.013354037267080746 - nodes in this community are weakly interconnected._
- **Why does `sharp` connect `package.json` to `generate-agenda-image-manifest.mjs`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Should `XFAObjectArray` be split into smaller, more focused modules?**
  _Cohesion score 0.023255813953488372 - nodes in this community are weakly interconnected._
- **Should `StringObject` be split into smaller, more focused modules?**
  _Cohesion score 0.02531645569620253 - nodes in this community are weakly interconnected._
- **Should `getStringOption` be split into smaller, more focused modules?**
  _Cohesion score 0.030264279624893437 - nodes in this community are weakly interconnected._
- **Should `OptionObject` be split into smaller, more focused modules?**
  _Cohesion score 0.029411764705882353 - nodes in this community are weakly interconnected._